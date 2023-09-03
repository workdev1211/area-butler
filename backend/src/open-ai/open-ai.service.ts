import { Injectable, Logger } from '@nestjs/common';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';

import { configService } from '../config/config.service';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import {
  openAiTranslationDictionary,
  osmNameToOsmQueryNameMapping,
} from '../../../shared/constants/open-ai';
import {
  ApiFurnishing,
  ApiRealEstateCostType,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import {
  ApiOpenAiResponseLimitTypesEnum,
  IApiOpenAiResponseLimit,
  OpenAiOsmQueryNameEnum,
} from '@area-butler-types/open-ai';
import { SearchResultSnapshotDocument } from '../location/schema/search-result-snapshot.schema';
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
import { osmEntityTypes } from '../../../shared/constants/constants';
import { calculateRelevantArea } from '../shared/geo-json.functions';

// Left just in case in order to be able to calculate the number of tokens
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { encode } = require('gpt-3-encoder');
// const usedTokens = encode(queryString).length;

interface ILocDescQueryData {
  searchResultSnapshot: SearchResultSnapshotDocument;
  meanOfTransportation: MeansOfTransportation;
  tonality: string;
  responseLimit?: IApiOpenAiResponseLimit;
  customText?: string;
  targetGroupName?: string;
}

interface ILocRealEstDescQueryData extends ILocDescQueryData {
  realEstateListing: Partial<IApiRealEstateListingSchema>;
}

const CHARACTER_LIMIT = 2000;
const POI_LIMIT_BY_CATEGORY = 3;

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  private readonly openAiApiKey = configService.getOpenAiApiKey();
  private readonly openAiConfig = new Configuration({
    apiKey: this.openAiApiKey,
  });
  private readonly openAiApi = new OpenAIApi(this.openAiConfig);

  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly zensusAtlasService: ZensusAtlasService,
  ) {}

  async getLocDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    {
      searchResultSnapshot: {
        snapshot,
        config: snapshotConfig = defaultSnapshotConfig,
      },
      responseLimit,
      tonality,
      customText,
      targetGroupName = 'Immobilieninteressent',
      meanOfTransportation,
    }: ILocDescQueryData,
  ): Promise<string> {
    let queryText = `Sei mein Experte für Immobilien-Exposés und schreibe einen werblichen Exposétext für eine Immobile mit der Adresse: ${snapshot.placesLocation.label}.`;
    queryText += ` Der Text darf insgesamt maximal ${this.getResponseTextLimit(
      responseLimit,
    )} Zeichen lang sein.`;

    if (!snapshotConfig.showAddress) {
      queryText += ' Die Adresse darf nicht explizit im Text genannt werden.';
    }

    queryText += ` Nutze eine ${tonality} Art der Formulierung.`;
    queryText += ` Bitte Beachte folgenden Wunsch bei der Erstellung: ${customText}.`;
    queryText += ` Der Text soll die Zielgruppe "${targetGroupName}" ansprechen. Erwähne vor allem POI-Kategorien die der Zielgruppe "${targetGroupName}" gefallen und lege dar warum diese Lage gerade für diese Zielgruppe optimal ist.`;
    queryText +=
      ' Wenn möglich, nenne die Entfernung zum nächstgelegenen internationalen Flughafen, nenne die Autobahnen die nah an der Immobilien verlaufen, nenne die nächste ÖPNV Möglichkeiten.\n';

    // POIs

    const processedPoiData = this.processPoiData(
      snapshot,
      snapshotConfig,
      meanOfTransportation,
    );
    const poiCategories = Object.keys(processedPoiData);

    if (poiCategories.length) {
      queryText += `Hier eine Tabelle mit den jeweils 3 nächsten erreichbaren POIs der jeweiligen Kategorie mit Entfernung in Meter und Name. Schaffe aus der Tabelle Mehrwert für die Zielgruppe "${targetGroupName}":\n`;

      poiCategories.forEach((category) => {
        queryText += `${category}:`;
        const pois = processedPoiData[category];
        pois.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

        pois.forEach(({ name, distanceInMeters }) => {
          queryText += ` ${name} (${Math.round(distanceInMeters)}m),`;
        });

        queryText = queryText.slice(0, -1);
        queryText += '.\n';
      });
    }

    // Location indices

    const locationIndices = await this.locationIndexService.query(user, {
      type: 'Point',
      coordinates: [snapshot.location.lng, snapshot.location.lat],
    });

    if (
      locationIndices.length &&
      Object.keys(locationIndices[0].properties).length
    ) {
      const resultingLocationIndices = processLocationIndices(
        locationIndices[0].properties,
      );

      queryText +=
        'Hier die von uns berechneten Lage-Indizes für diese Adresse. Diese aggregieren alle POIs in der Umgebung der Adresse, gewichten Sie nach der Distanz und errechnen eine Zahl zwischen 0-100%. Zudem fließt auch die Flächenbedeckung mit ein. z.B. je mehr Grünflächen in der Umgebung desto höher der Gesundheitsindex. Benutze die Indizes für qualitative Aussagen ohne die Indizes explizit zu erwähnen:\n';

      Object.values(resultingLocationIndices).forEach(({ name, value }) => {
        queryText += `${name}: ${value}%, `;
      });

      queryText = queryText.slice(0, -2);
      queryText += '.\n';
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
        'Hier ist zudem die Analyse der Zensus Daten an der Adresse. Nutze die Zahlen zu positiven Formulierungen für die Zielgruppe. Nenne keine Zahlen Quantitativ sondern kreiere nur qualitative Aussagen:\n';

      Object.values(processedCensusData).forEach(
        ({ label, value: { addressData } }) => {
          queryText += `${label}: ${addressData}, `;
        },
      );

      queryText = queryText.slice(0, -2);
      queryText += '.\n';
    }

    // TODO will be added later
    // // Landcover data
    //
    // queryText +=
    //   'Hier die Landcover data für diese plz. Nutze diese Prozentzahlen für qualitative Aussagen welche Flächenbedeckung diese Umgebung prägt:';

    return queryText;
  }

  getRealEstDescQuery(
    {
      address,
      characteristics,
      costStructure,
    }: Partial<IApiRealEstateListingSchema>,
    responseLimit?: IApiOpenAiResponseLimit,
    initialQueryText = `Schreibe eine ${this.getResponseTextLimit(
      responseLimit,
    )} lange, werbliche Beschreibung in einem Immobilienexposee.\n\n`,
  ): string {
    const objectType = 'Haus';

    // Keep in mind that in the future, the currency may not only be the Euro
    // minPrice is a minimum price, price is a price or a maximum one
    const price =
      costStructure &&
      ((!costStructure.minPrice?.amount && costStructure.price?.amount) ||
      (costStructure.minPrice?.amount && !costStructure.price?.amount)
        ? costStructure.minPrice?.amount || costStructure.price?.amount
        : (costStructure.minPrice?.amount + costStructure.price?.amount) / 2);

    const costType = costStructure?.type;

    let queryText = initialQueryText;

    switch (objectType) {
      case 'Haus': {
        queryText += 'Das Exposee ist für ein Haus.';
        break;
      }

      // For future usage
      // case 'Wohnung': {
      //   queryText += ' Das Exposee ist für eine Wohnung.';
      //   break;
      // }

      default: {
        queryText += ' Das Exposee ist für eine Objekt.';
      }
    }

    if (price && costType) {
      switch (costType) {
        case ApiRealEstateCostType.RENT_MONTHLY_COLD: {
          queryText += ` Das Objekt kostet ${price} Euro kalt zur Miete.`;
          break;
        }

        case ApiRealEstateCostType.RENT_MONTHLY_WARM: {
          queryText += ` Das Objekt kostet ${price} Euro warm zur Miete.`;
          break;
        }

        default: {
          queryText += ` Das Objekt hat einen Kaufpreis von ${price} Euro.`;
        }
      }
    }

    if (address) {
      queryText += ` Die Adresse lautet ${address}.`;
    }
    if (characteristics.propertySizeInSquareMeters) {
      queryText += ` Zu dem Objekt gehört ein Grundstück mit einer Fläche von ${characteristics.propertySizeInSquareMeters}qm.`;
    }
    if (characteristics.realEstateSizeInSquareMeters) {
      queryText += ` Die Wohnfläche beträgt ${characteristics.realEstateSizeInSquareMeters}qm.`;
    }
    if (characteristics.numberOfRooms) {
      queryText += ` Es gibt ${characteristics.numberOfRooms} Zimmer.`;
    }
    if (characteristics.energyEfficiency) {
      queryText += ` Die Energieeffizienzklasse des Objektes ist '${characteristics.energyEfficiency}'.`;
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.GARDEN)) {
      queryText += ' Es gibt einen Garten.';
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.BALCONY)) {
      queryText += ' Das Objekt verfügt über einen Balkon.';
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.BASEMENT)) {
      queryText += ' Zu dem Objekt gehört ein Keller.';
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.GUEST_REST_ROOMS)) {
      queryText += ' Es gibt ein Gäste-WC.';
    }
    if (
      characteristics?.furnishing?.includes(ApiFurnishing.UNDERFLOOR_HEATING)
    ) {
      queryText += ' Bei der Heizung handelt es sich um ein Fußbodenheizung.';
    }
    if (
      characteristics?.furnishing?.includes(ApiFurnishing.GARAGE_PARKING_SPACE)
    ) {
      queryText += ' Zugehörig gibt es einen Stellplatz.';
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.ACCESSIBLE)) {
      queryText += ' Das Objekt ist barrierefrei eingerichtet und zugänglich.';
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.FITTED_KITCHEN)) {
      queryText += ' Das Objekt verfügt über eine Einbauküche.';
    }

    return `${queryText}\n\n`;
  }

  getLocRealEstDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    {
      searchResultSnapshot: {
        snapshot,
        config: snapshotConfig = defaultSnapshotConfig,
      },
      responseLimit,
      tonality,
      customText,
      targetGroupName = 'Immobilieninteressent',
      meanOfTransportation,
      realEstateListing,
    }: ILocRealEstDescQueryData,
  ): string {
    const poiCount: Partial<Record<OpenAiOsmQueryNameEnum, number>> =
      snapshot.searchResponse.routingProfiles[
        meanOfTransportation
      ].locationsOfInterest.reduce((result, { entity: { name, type } }) => {
        const osmQueryName =
          osmNameToOsmQueryNameMapping[
            Object.values(OsmName).includes(type as unknown as OsmName)
              ? (type as unknown as OsmName)
              : name
          ];

        if (!osmQueryName) {
          return result;
        }

        if (!result[osmQueryName]) {
          result[osmQueryName] = 0;
        }

        result[osmQueryName] += 1;

        return result;
      }, {});

    const initialQueryText =
      `Schreibe eine ${this.getResponseTextLimit(
        responseLimit,
      )} lange Beschreibung der Lage einer Immobilie für Immobilienexposee. Nutze eine ${tonality} Art der ` +
      `Formulierung. Im Fließtext erwähne die Points of Interest nicht mit Zahlen, sondern nur mit Worten ` +
      `"einige, viele, ausreichend, ...". Im Anschluss an den Text füge dann eine Bullet-Liste mit den ` +
      `Zahlen der Points of Interest hinzu. Verwende HTML Zeilenumbrüche.`;

    let queryText = this.getRealEstDescQuery(
      realEstateListing,
      undefined,
      initialQueryText,
    ).replace('\n\n', '\n');

    if (poiCount[OpenAiOsmQueryNameEnum.PUBLIC_TRANSPORT]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.PUBLIC_TRANSPORT]
      } ÖPNV Haltestellen\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.HIGHWAY_ACCESS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.HIGHWAY_ACCESS]
      } Autobahnauffahrten\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.CHARGING_STATIONS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.CHARGING_STATIONS]
      } E-Ladestellen\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.GAS_STATIONS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.GAS_STATIONS]
      } Tankstellen\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SUPERMARKETS_AND_DRUGSTORES]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.SUPERMARKETS_AND_DRUGSTORES]
      } Supermärkte und Drogerien\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SCHOOLS_AND_KINDERGARDEN]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.SCHOOLS_AND_KINDERGARDEN]
      } Schulen und Kindergärten`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.UNIVERSITIES]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.UNIVERSITIES]
      } Univerität(en)\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.PLAYGROUNDS_AND_PARKS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.PLAYGROUNDS_AND_PARKS]
      } Spielplätze und Parks\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.BARS_AND_RESTAURANTS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.BARS_AND_RESTAURANTS]
      } Bars und Restaurants\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.THEATERS]) {
      queryText += ` - ${poiCount[OpenAiOsmQueryNameEnum.THEATERS]} Theater\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SPORTS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.SPORTS]
      } Sportangebote\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SWIMMING_POOLS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.SWIMMING_POOLS]
      } Swimmingpools und Schwimmbäder\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.DOCTORS]) {
      queryText += ` - ${poiCount[OpenAiOsmQueryNameEnum.DOCTORS]} Ärzte\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.PHARMACIES]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.PHARMACIES]
      } Apotheken\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.HOSPITALS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.HOSPITALS]
      } Krankenhäuser\n`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SIGHTS]) {
      queryText += ` - ${
        poiCount[OpenAiOsmQueryNameEnum.SIGHTS]
      } Sehenswürdigkeiten\n`;
    }

    if (customText) {
      queryText += `\n${customText}`;
    }

    return `${queryText}\n\n`;
  }

  getFormToInformQuery(formalText: string): string {
    return `Ersetze im folgenden text die formale Sie-Form durch die informale Du-Form: \n\n ${formalText}`;
  }

  async fetchResponse(queryText: string): Promise<string> {
    this.logger.log(
      `\n===== QUERY START =====\n${queryText}\n===== QUERY END =====\n`,
    );

    const {
      data: { choices },
    }: AxiosResponse<CreateCompletionResponse> = await this.openAiApi.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Du bist Texter/in in einer Immobilienagentur. Du schreibst kreative und korrekte Beschreibungen von Immobilienangeboten und deren Umgebung',
          },
          { role: 'user', content: queryText },
        ],
        temperature: 1,
        max_tokens: 1200,
        top_p: 1,
        n: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    );

    return choices[0]['message']['content'].replace(/^(\n)*(.*)/g, '$2');
  }

  private getResponseTextLimit(
    responseLimit?: IApiOpenAiResponseLimit,
  ): string {
    if (!responseLimit) {
      return `maximal ${CHARACTER_LIMIT} Zeichen`;
    }

    const { quantity, type } = responseLimit;

    return type === ApiOpenAiResponseLimitTypesEnum.CHARACTER
      ? `maximal ${quantity} Zeichen`
      : `etwa ${quantity} Worte`;
  }

  private processPoiData(
    snapshot: ApiSearchResultSnapshot,
    snapshotConfig: ApiSearchResultSnapshotConfig,
    meanOfTransportation: MeansOfTransportation,
  ): Partial<Record<OsmName, { name: string; distance: number }[]>> {
    const selectedPoiCategories = osmEntityTypes.reduce<OsmName[]>(
      (result, { label, name }) => {
        if (snapshotConfig.defaultActiveGroups.includes(label)) {
          result.push(name);
        }

        return result;
      },
      [],
    );

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

      if (
        selectedPoiCategories.length &&
        !selectedPoiCategories.includes(osmName)
      ) {
        return result;
      }

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
}
