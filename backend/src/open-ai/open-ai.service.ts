import { Injectable, Logger } from '@nestjs/common';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';
// import { encoding_for_model, Tiktoken } from '@dqbd/tiktoken';
import { configService } from '../config/config.service';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import {
  openAiTextLengthOptions,
  openAiTranslationDictionary,
} from '../../../shared/constants/open-ai';
import {
  ApiFurnishing,
  ApiRealEstateCostType,
  ApiRealEstateListing,
} from '@area-butler-types/real-estate';
import { OpenAiTextLengthEnum } from '@area-butler-types/open-ai';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { processLocationIndices } from '../../../shared/functions/location-index.functions';
import { ZensusAtlasService } from '../data-provision/zensus-atlas/zensus-atlas.service';
import {
  cleanCensusProperties,
  processCensusData,
} from '../../../shared/functions/census.functions';
import { calculateRelevantArea } from '../shared/functions/geo-json';
import { defaultTargetGroupName } from '../../../shared/constants/potential-customer';
import { OsmEntityMapper } from '@area-butler-types/osm-entity-mapper';
import { defaultSnapshotConfig } from '../../../shared/constants/location';

// TODO remove similar interfaces like for the frontend part
interface IGeneralQueryData {
  tonality: string; // should be enum
  customText?: string;
  textLength?: OpenAiTextLengthEnum;
  targetGroupName?: string;
  language?: string;
}

interface ILocDescQueryData extends IGeneralQueryData {
  snapshotRes: ApiSearchResultSnapshotResponse;
  meanOfTransportation: MeansOfTransportation;
  isForOnePage?: boolean;
}

interface IRealEstDescQueryData extends IGeneralQueryData {
  realEstate: Partial<ApiRealEstateListing>;
  realEstateType: string;
}

interface ILocRealEstDescQueryData
  extends ILocDescQueryData,
    Omit<IRealEstDescQueryData, 'realEstate'> {}

const POI_LIMIT_BY_CATEGORY = 3;
const MODEL_NAME = 'gpt-4o';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  private readonly openAiApiKey = configService.getOpenAiApiKey();
  private readonly openAiConfig = new Configuration({
    apiKey: this.openAiApiKey,
  });
  private readonly openAiApi = new OpenAIApi(this.openAiConfig);
  private readonly systemEnv = configService.getSystemEnv();

  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly zensusAtlasService: ZensusAtlasService,
  ) {}

  async getLocDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    { isForOnePage, ...queryData }: ILocDescQueryData,
  ): Promise<string> {
    const {
      snapshotRes: {
        snapshot,
        config: snapshotConfig = { ...defaultSnapshotConfig },
      },
      targetGroupName = defaultTargetGroupName,
    } = queryData;

    return (
      `Du bist ein erfahrener Immobilienmakler. Schreibe eine werbliche Lagebeschreibung für eine Wohnimmobilie` +
      (snapshotConfig.showAddress
        ? ` an der Adresse + ${snapshot.placesLocation.label}. `
        : '. ') +
      `Der Text soll die Zielgruppe "${targetGroupName}" ansprechen, und keine Sonderzeichen oder Emoticons verwenden. ` +
      `Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n\n` +
      this.getTextualRequirements(queryData, true, false, isForOnePage) +
      `\n\n` +
      (await this.getLocationDescription(queryData, user))
    );
  }

  getRealEstDescQuery(queryData: IRealEstDescQueryData): string {
    const {
      realEstateType,
      realEstate: { address, costStructure, characteristics },
      targetGroupName = defaultTargetGroupName,
    } = queryData;
    return (
      `Du bist ein erfahrener Immobilienmakler. Schreibe eine ansprechende Objektbeschreibung für ein ${realEstateType} an der Adresse ${address}. Der Text soll ${targetGroupName} ansprechen. Verwende keine Sonderzeichen und Emoticons. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n` +
      this.getTextualRequirements(queryData, false, true) +
      '\n\n' +
      this.getRealEstateDescription({
        realEstateType,
        realEstate: { costStructure, characteristics },
      })
    );
  }

  async getLocRealEstDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    { realEstateType, ...queryData }: ILocRealEstDescQueryData,
  ): Promise<string> {
    const {
      targetGroupName,
      snapshotRes: { config, realEstate },
    } = queryData;

    const initialText = config.showAddress
      ? `Du bist ein erfahrener Immobilienmakler. Schreibe einen werblichen Exposétext für ein Objekt an der Adresse + ${realEstate.address}. Der Text soll ${targetGroupName} ansprechen. Verwende keine Sonderzeichen und Emoticons. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n`
      : `Du bist ein erfahrener Immobilienmakler. Schreibe einen werblichen Exposétext für ein Objekt. Der Text soll ${targetGroupName} ansprechen. Verwende keine Sonderzeichen und Emoticons. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n`;

    return (
      initialText +
      this.getTextualRequirements(queryData, true, true) +
      '\n\n' +
      (await this.getLocationDescription(queryData, user)) +
      (realEstate &&
        '\n\n' +
          this.getRealEstateDescription({
            realEstateType,
            realEstate: {
              costStructure: realEstate.costStructure,
              characteristics: realEstate.characteristics,
            },
          }))
    );
  }

  getImproveText(originalText: string, customText: string) {
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

  async fetchResponse(queryText: string): Promise<string> {
    // let encoding: Tiktoken;

    if (this.systemEnv !== 'prod') {
      this.logger.verbose(
        '\n====== QUERY LENGTH ======\n' +
          `CHARACTERS: ${queryText.length}` +
          '\n====== QUERY START ======\n' +
          queryText +
          '\n====== QUERY END ======',
      );

      // encoding = encoding_for_model(MODEL_NAME);
      //
      // this.logger.verbose(
      //   '\n====== QUERY LENGTH ======\n' +
      //     `CHARACTERS: ${queryText.length} / TOKENS: ${
      //       encoding.encode(queryText).length
      //     }` +
      //     '\n====== QUERY START ======\n' +
      //     queryText +
      //     '\n====== QUERY END ======',
      // );
    }

    const {
      data: { choices },
    }: AxiosResponse<CreateCompletionResponse> = await this.openAiApi.createChatCompletion(
      {
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content:
              'Du bist Texter/in in einer Immobilienagentur. Du schreibst kreative und korrekte Beschreibungen von Immobilienangeboten und deren Umgebung',
          },
          { role: 'user', content: queryText },
        ],
        temperature: 1,
        top_p: 1,
        n: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    );

    const response = choices[0]['message']['content'].replace(
      /^(\n)*(.*)/g,
      '$2',
    );

    if (this.systemEnv !== 'prod') {
      this.logger.verbose(
        '\n====== RESPONSE LENGTH ======\n' +
          `CHARACTERS: ${response.length}` +
          '\n====== RESPONSE START ======\n' +
          response +
          '\n====== RESPONSE END ======',
      );

      // this.logger.verbose(
      //   '\n====== RESPONSE LENGTH ======\n' +
      //     `CHARACTERS: ${response.length} / TOKENS: ${
      //       encoding.encode(response).length
      //     }` +
      //     '\n====== RESPONSE START ======\n' +
      //     response +
      //     '\n====== RESPONSE END ======',
      // );
      //
      // encoding.free();
    }

    return response;
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
    snapshotConfig: ApiSearchResultSnapshotConfig,
    meanOfTransportation: MeansOfTransportation,
  ): Partial<Record<OsmName, { name: string; distance: number }[]>> {
    // const osmEntityMapping = [...new OsmEntityMapper().getGroupNameMapping()];

    // const selectedPoiCategories = osmEntityMapping.reduce<Set<OsmName>>(
    //   (result, [groupName, [...osmEntities]]) => {
    //     if (snapshotConfig.defaultActiveGroups?.includes(groupName)) {
    //       osmEntities.forEach(({ name }) => result.add(name));
    //     }
    //
    //     return result;
    //   },
    //   new Set(),
    // );

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

      // if (selectedPoiCategories.size && !selectedPoiCategories.has(osmName)) {
      //   return result;
      // }

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

  private getTextualRequirements(
    {
      tonality,
      language,
      customText,
      targetGroupName = defaultTargetGroupName,
      textLength = OpenAiTextLengthEnum.MEDIUM,
    }: IGeneralQueryData,
    locationText = false,
    realEstateText = false,
    isForOnePage = false,
  ): string {
    return (
      'Der Text soll:\n' +
      [
        isForOnePage
          ? `Der Text darf maximal 500 Zeichen lang sein.`
          : openAiTextLengthOptions.find(({ value }) => value === textLength)
              .text,
        `eine ${tonality} Tonalität haben`,
        `die Zielgruppe "${targetGroupName}" ansprechen`,
        ...(realEstateText
          ? [`darlegen, warum dieses Objekt für diese Zielgruppe passt`]
          : []),
        ...(locationText
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

  private async getLocationDescription(
    {
      snapshotRes: {
        snapshot,
        config: snapshotConfig = { ...defaultSnapshotConfig },
      },
      meanOfTransportation,
      targetGroupName = defaultTargetGroupName,
    }: ILocDescQueryData,
    user: UserDocument | TIntegrationUserDocument,
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
      snapshotConfig,
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

  private getRealEstateDescription({
    realEstateType,
    realEstate: { costStructure, characteristics },
  }): string {
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
