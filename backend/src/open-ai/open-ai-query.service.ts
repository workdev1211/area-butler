import { Injectable } from '@nestjs/common';

import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import {
  openAiTextLengthOptions,
  openAiTonalities,
  openAiTranslationDictionary,
} from '../../../shared/constants/open-ai';
import {
  ApiFurnishing,
  ApiRealEstateCostType,
  ApiRealEstateListing,
} from '@area-butler-types/real-estate';
import {
  IApiOpenAiLocDescQuery,
  IApiOpenAiRealEstDescQuery,
  IOpenAiGeneralFormValues,
  OpenAiTextLengthEnum,
} from '@area-butler-types/open-ai';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { processLocationIndices } from '../../../shared/functions/location-index.functions';
import { ZensusAtlasService } from '../data-provision/zensus-atlas/zensus-atlas.service';
import { defaultSnapshotConfig } from '../../../shared/constants/location';
import {
  cleanCensusProperties,
  processCensusData,
} from '../../../shared/functions/census.functions';
import { calculateRelevantArea } from '../shared/functions/geo-json';
import { defaultTargetGroupName } from '../../../shared/constants/potential-customer';

interface IGeneralQueryParams extends IOpenAiGeneralFormValues {
  language?: string;
}

export interface ILocDescQueryParams
  extends IGeneralQueryParams,
    Omit<IApiOpenAiLocDescQuery, 'snapshotId'> {
  snapshotRes: ApiSearchResultSnapshotResponse;
}

export interface IRealEstDescQueryParams
  extends IGeneralQueryParams,
    Omit<IApiOpenAiRealEstDescQuery, 'realEstateId'> {
  realEstate: Partial<ApiRealEstateListing>;
}

export interface ILocRealEstDescQueryParams
  extends ILocDescQueryParams,
    IRealEstDescQueryParams {}

interface IGetTextReqsParams {
  queryParams: IGeneralQueryParams;
  isLocDescPresent?: boolean;
  isRealEstDescPresent?: boolean;
  isForOnePage?: boolean;
}

interface IGetRealEstDescParams {
  realEstate: Partial<ApiRealEstateListing>;
  realEstateType: string;
}

const POI_LIMIT_BY_CATEGORY = 3;

@Injectable()
export class OpenAiQueryService {
  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly zensusAtlasService: ZensusAtlasService,
  ) {}

  async getLocDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    { isForOnePage, ...queryParams }: ILocDescQueryParams,
  ): Promise<string> {
    const {
      snapshotRes: { snapshot, config = { ...defaultSnapshotConfig } },
      targetGroupName = defaultTargetGroupName,
    } = queryParams;

    return (
      `Du bist ein erfahrener Immobilienmakler. Schreibe eine werbliche Lagebeschreibung für eine Wohnimmobilie` +
      (config.showAddress
        ? ` an der Adresse + ${snapshot.placesLocation.label}. `
        : '. ') +
      `Der Text soll die Zielgruppe "${targetGroupName}" ansprechen, und keine Sonderzeichen oder Emoticons verwenden. ` +
      `Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n\n` +
      this.getTextReqs({
        isForOnePage,
        queryParams,
        isLocDescPresent: true,
      }) +
      `\n\n` +
      (await this.getLocDesc(user, queryParams))
    );
  }

  getRealEstDescQuery(queryParams: IRealEstDescQueryParams): string {
    const {
      realEstate,
      realEstateType,
      targetGroupName = defaultTargetGroupName,
    } = queryParams;

    return (
      `Du bist ein erfahrener Immobilienmakler. Schreibe eine ansprechende Objektbeschreibung für ein ${realEstateType} an der Adresse ${realEstate.address}. Der Text soll ${targetGroupName} ansprechen. Verwende keine Sonderzeichen und Emoticons. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n` +
      this.getTextReqs({
        queryParams,
        isRealEstDescPresent: true,
      }) +
      '\n\n' +
      this.getRealEstDesc({
        realEstate,
        realEstateType,
      })
    );
  }

  async getLocRealEstDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    { realEstate, realEstateType, ...queryParams }: ILocRealEstDescQueryParams,
  ): Promise<string> {
    const {
      targetGroupName,
      snapshotRes: { config },
    } = queryParams;

    const initialText = config.showAddress
      ? `Du bist ein erfahrener Immobilienmakler. Schreibe einen werblichen Exposétext für ein Objekt an der Adresse + ${realEstate.address}. Der Text soll ${targetGroupName} ansprechen. Verwende keine Sonderzeichen und Emoticons. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n`
      : `Du bist ein erfahrener Immobilienmakler. Schreibe einen werblichen Exposétext für ein Objekt. Der Text soll ${targetGroupName} ansprechen. Verwende keine Sonderzeichen und Emoticons. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n`;

    return (
      initialText +
      this.getTextReqs({
        queryParams,
        isLocDescPresent: true,
        isRealEstDescPresent: true,
      }) +
      '\n\n' +
      (await this.getLocDesc(user, queryParams)) +
      (realEstate &&
        '\n\n' +
          this.getRealEstDesc({
            realEstate,
            realEstateType,
          }))
    );
  }

  getImprovedText(originalText: string, customText: string): string {
    return (
      `Sei mein Experte für Immobilien. Es wurde ein Text zu einer Immobilie erstellt, allerdings hat der Autor folgenden Änderungswunsch: ${customText}\n` +
      '\nDer Text soll, sofern der Änderungswunsch nichts anderes fordert:\n' +
      '- die Tonalität beibehalten\n' +
      '- die Sprache beibehalten\n' +
      '- do not include any explanation\n' +
      '\nDer Änderungswunsch soll auf den folgenden Text angewandt werden:\n' +
      originalText
    );
  }

  getFormToInformQuery(formalText: string): string {
    return `Ersetze im folgenden text die formale Sie-Form durch die informale Du-Form: \n\n ${formalText}`;
  }

  // Left in case of a future progress in OpenAi text limiting
  // private getResponseTextLimit(
  //   responseLimit?: IApiOpenAiResponseLimit,
  // ): string {
  //   if (!responseLimit) {
  //     return `maximal ${maxCharacterNumber} Zeichen`;
  //   }
  //
  //   const { quantity, type } = responseLimit;
  //
  //   return type === ApiOpenAiRespLimitTypesEnum.CHARACTER
  //     ? `maximal ${quantity} Zeichen`
  //     : `etwa ${quantity} Worte`;
  // }

  private processPoiData(
    snapshot: ApiSearchResultSnapshot,
    meanOfTransportation: MeansOfTransportation,
  ): Partial<Record<OsmName, { name: string; distance: number }[]>> {
    return snapshot.searchResponse.routingProfiles[
      meanOfTransportation
    ].locationsOfInterest.reduce((result, location) => {
      const {
        entity: { name, type, title, label },
        distanceInMeters,
      } = location;

      const osmName = Object.values(OsmName).includes(
        type as unknown as OsmName,
      )
        ? (type as unknown as OsmName)
        : name;

      const resultingName = openAiTranslationDictionary[osmName].plural;

      if (!result[resultingName]) {
        result[resultingName] = [];
      }

      if (result[resultingName].length < POI_LIMIT_BY_CATEGORY) {
        result[resultingName].push({
          distanceInMeters,
          name: title || label,
        });
      }

      return result;
    }, {});
  }

  private getTextReqs({
    queryParams: {
      tonality,
      language,
      customText,
      targetGroupName = defaultTargetGroupName,
      textLength = OpenAiTextLengthEnum.MEDIUM,
    },
    isLocDescPresent = false,
    isRealEstDescPresent = false,
    isForOnePage = false,
  }: IGetTextReqsParams): string {
    return (
      'Der Text soll:\n' +
      [
        isForOnePage
          ? `Der Text darf maximal 500 Zeichen lang sein.`
          : openAiTextLengthOptions.find(({ value }) => value === textLength)
              .text,
        `eine ${openAiTonalities[tonality]} Tonalität haben`,
        `die Zielgruppe "${targetGroupName}" ansprechen`,
        ...(isRealEstDescPresent
          ? [`darlegen, warum dieses Objekt für diese Zielgruppe passt`]
          : []),
        ...(isLocDescPresent
          ? [
              `Lagedetails und die für die Zielgruppe "${targetGroupName}" wichtigsten POIs namentlich nennen`,
              `nur gerundete ca. Angaben statt exakten Metern und Minuten verwenden`,
              `Entfernung zum nächstgelegenen internationalen Flughafen, Autobahnen und ÖPNV nennen`,
            ]
          : []),
        `verwende als Ausgabesprache ${language || 'DE'} (BCP 47)`,
        customText === 'Teaser Text für Portale und aufbauenden Text generieren'
          ? `generiere zwei aufeinander aufbauende Texte. 1) Teaser Text für Immobilienportale der am Ende einen Cliffhanger hat und 2) Ausführlichen Text der auf dem ersten aufbaut, auf die Details eingeht und die Teaser des ersten Texts aufnimmt`
          : `bitte beachte folgenden Wunsch bei der Erstellung: ${customText}`,
        `do not include any explanation`,
      ]
        .map((value) => `- ${value}`)
        .join('\n')
    );
  }

  private async getLocDesc(
    user: UserDocument | TIntegrationUserDocument,
    {
      snapshotRes: { snapshot },
      meanOfTransportation,
      targetGroupName = defaultTargetGroupName,
    }: ILocDescQueryParams,
  ): Promise<string> {
    let queryText =
      `Nutze folgende Informationen und baue daraus positive Argumente für die Zielgruppe "${targetGroupName}":\n` +
      `1. Detaillierte POI Tabelle aus dem AreaButler (siehe unten).\n` +
      `2. Lage-Indizes (siehe unten): Verwende diese für qualitative Aussagen, ohne die Indizes explizit zu erwähnen.\n` +
      `3. Zensus-Daten (siehe unten): z.B. Einwohner, Durchschnittsalter, Leerstand etc.\n` +
      `4. Führe in jedem Fall eine eigene Online-Recherche der Adresse ${snapshot.placesLocation.label} aus und nutze zusätzlich gewonnene Informationen insbesondere für eine kurze Beschreibung der Charakteristika der Straße in der die Adresse liegt. Trotzdem darf der Name der Adresse nicht eplizit im Text genannt werden.` +
      `\nDaten`;

    // POIs

    const processedPoiData = this.processPoiData(
      snapshot,
      meanOfTransportation,
    );

    const poiCategories = Object.keys(processedPoiData);

    if (poiCategories.length > 0) {
      queryText +=
        '\n\nPOIs:\n' +
        poiCategories
          .map((category) => {
            const pois = processedPoiData[category];
            pois.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

            return `${category}: (${pois
              .map(
                ({ name, distanceInMeters }) =>
                  `${name} (${Math.round(distanceInMeters)}m)`,
              )
              .join(', ')})`;
          })
          .join('\n');
    }

    // Location indices

    const locationIndices = await this.locationIndexService.queryWithUser(
      user,
      {
        type: 'Point',
        coordinates: [snapshot.location.lng, snapshot.location.lat],
      },
    );

    if (
      locationIndices.length &&
      Object.keys(locationIndices[0].properties).length
    ) {
      const resultingLocationIndices = processLocationIndices(
        locationIndices[0].properties,
      );

      queryText +=
        `\n\nLage-Indizes:\n` +
        Object.values(resultingLocationIndices)
          .map(({ name, value }) => `${name}: ${value}%`)
          .join('\n');
    }

    // Zensus data

    const zensusData = await this.zensusAtlasService.query(
      user,
      calculateRelevantArea(snapshot.location).geometry,
    );

    if (Object.values(zensusData).some((dataType) => dataType.length > 0)) {
      const processedCensusData = processCensusData(
        cleanCensusProperties(zensusData),
      );

      queryText +=
        '\n\nZensus Daten:\n' +
        Object.values(processedCensusData)
          .map(
            ({ label, value: { addressData } }) => `${label}: ${addressData}`,
          )
          .join('\n');
    }

    return queryText;
  }

  private getRealEstDesc({
    realEstateType,
    realEstate: { costStructure, characteristics },
  }: IGetRealEstDescParams): string {
    const objectDetails: string[] = [
      `Das Exposee ist für ein ${realEstateType}`,
    ];

    // Keep in mind that in the future, the currency may not only be the Euro
    // minPrice is a minimum price, price is a price or a maximum one
    const price =
      costStructure &&
      ((!costStructure.minPrice?.amount && costStructure.price?.amount) ||
      (costStructure.minPrice?.amount && !costStructure.price?.amount)
        ? costStructure.minPrice?.amount || costStructure.price?.amount
        : (costStructure.minPrice?.amount + costStructure.price?.amount) / 2);

    const costType = costStructure?.type;

    if (price && costType) {
      switch (costType) {
        case ApiRealEstateCostType.RENT_MONTHLY_COLD: {
          objectDetails.push(`Das Objekt kostet ${price} Euro kalt zur Miete`);
          break;
        }

        case ApiRealEstateCostType.RENT_MONTHLY_WARM: {
          objectDetails.push(`Das Objekt kostet ${price} Euro warm zur Miete`);
          break;
        }

        default: {
          objectDetails.push(
            `Das Objekt hat einen Kaufpreis von ${price} Euro`,
          );
        }
      }
    }

    if (characteristics?.propertySizeInSquareMeters) {
      objectDetails.push(
        `Zu dem Objekt gehört ein Grundstück mit einer Fläche von ${characteristics.propertySizeInSquareMeters}qm`,
      );
    }
    if (characteristics?.realEstateSizeInSquareMeters) {
      objectDetails.push(
        `Die Wohnfläche beträgt ${characteristics.realEstateSizeInSquareMeters}qm`,
      );
    }
    if (characteristics?.numberOfRooms) {
      objectDetails.push(`Es gibt ${characteristics.numberOfRooms} Zimmer`);
    }
    if (characteristics?.energyEfficiency) {
      objectDetails.push(
        `Die Energieeffizienzklasse des Objektes ist '${characteristics.energyEfficiency}'`,
      );
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.GARDEN)) {
      objectDetails.push('Es gibt einen Garten');
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.BALCONY)) {
      objectDetails.push('Das Objekt verfügt über einen Balkon');
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.BASEMENT)) {
      objectDetails.push(' Zu dem Objekt gehört ein Keller');
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.GUEST_REST_ROOMS)) {
      objectDetails.push(' Es gibt ein Gäste-WC');
    }
    if (
      characteristics?.furnishing?.includes(ApiFurnishing.UNDERFLOOR_HEATING)
    ) {
      objectDetails.push(
        ' Bei der Heizung handelt es sich um ein Fußbodenheizung',
      );
    }
    if (
      characteristics?.furnishing?.includes(ApiFurnishing.GARAGE_PARKING_SPACE)
    ) {
      objectDetails.push(' Zugehörig gibt es einen Stellplatz');
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.ACCESSIBLE)) {
      objectDetails.push(
        ' Das Objekt ist barrierefrei eingerichtet und zugänglich',
      );
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.FITTED_KITCHEN)) {
      objectDetails.push(' Das Objekt verfügt über eine Einbauküche');
    }

    return (
      'Hier sind Details für dich zum Objekt:\n' +
      objectDetails.map((detail) => `- ${detail}`).join('\n')
    );
  }
}
