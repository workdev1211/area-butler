import { Injectable, Logger } from '@nestjs/common';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';

import { configService } from '../config/config.service';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import {
  ApiSearchResultSnapshot,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import {
  openAiTranslationDictionary,
  osmNameToOsmQueryNameMapping,
} from '../../../shared/constants/open-ai';
import { RealEstateListingDocument } from '../real-estate-listing/schema/real-estate-listing.schema';
import {
  ApiFurnishing,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import { OpenAiOsmQueryNameEnum } from '@area-butler-types/open-ai';

// Left just in case in order to be able to calculate the number of tokens
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { encode } = require('gpt-3-encoder');
// const usedTokens = encode(queryString).length;

interface ILocationDescriptionQueryData {
  snapshot: ApiSearchResultSnapshot;
  meanOfTransportation: MeansOfTransportation;
  tonality: string;
  customText?: string;
  characterLimit?: number;
}

interface ILocationRealEstateDescriptionQueryData
  extends ILocationDescriptionQueryData {
  realEstateListing: RealEstateListingDocument;
  characterLimit?: number;
}

const CHARACTER_LIMIT = 2000;
const WORD_LIMIT = 700;

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  private readonly openAiApiKey = configService.getOpenAiApiKey();
  private readonly openAiConfig = new Configuration({
    apiKey: this.openAiApiKey,
  });
  private readonly openAiApi = new OpenAIApi(this.openAiConfig);

  getLocationDescriptionQuery({
    snapshot,
    meanOfTransportation,
    tonality,
    customText,
    characterLimit = CHARACTER_LIMIT,
  }: ILocationDescriptionQueryData): string {
    const poiCount: Partial<Record<OsmName, number>> =
      snapshot.searchResponse.routingProfiles[
        meanOfTransportation
      ].locationsOfInterest.reduce((result, { entity: { name, type } }) => {
        const osmName = Object.values(OsmName).includes(
          type as unknown as OsmName,
        )
          ? (type as unknown as OsmName)
          : name;

        if (!result[osmName]) {
          result[osmName] = 0;
        }

        result[osmName] += 1;

        return result;
      }, {});

    const initialQueryText =
      `Schreibe eine maximal ${characterLimit} Zeichen lange Beschreibung der Lage einer Immobilie für ` +
      `Immobilienexposee. Nutze eine ${tonality} Art der Formulierung. Erwähne im Text die Points of ` +
      'Interest nicht mit absoluten Zahlen, sondern nur qualitativ oder mit "einige, viele, ausreichend". ' +
      'Beende den Text mit einer Bullet-Liste der Points of Interest.\nDie Points of interest sind: ' +
      `${snapshot.placesLocation.label}.\n`;

    const poiCountEntries = Object.entries(poiCount);

    let queryText = poiCountEntries.reduce(
      (result, [name, count]: [OsmName, number], i) => {
        result += `Anzahl ${
          count === 1
            ? openAiTranslationDictionary[name].singular
            : openAiTranslationDictionary[name].plural
        }: ${count}${poiCountEntries.length - 1 === i ? '' : '\n'}`;

        return result;
      },
      initialQueryText,
    );

    queryText += '\nBitte erwähne keine Schwimmbäder.';

    if (customText) {
      queryText += `\n${customText}`;
    }

    return queryText;
  }

  getRealEstateDescriptionQuery(
    { address, characteristics, costStructure }: RealEstateListingDocument,
    characterLimit = CHARACTER_LIMIT,
    initialQueryText = `Schreibe eine maximal ${characterLimit} Zeichen lange, werbliche Beschreibung in einem Immobilienexposee.\n\n`,
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

    return `${queryText}\nBitte erwähne keine Schwimmbäder.\n\n`;
  }

  getLocationRealEstateDescriptionQuery({
    snapshot,
    meanOfTransportation,
    tonality,
    customText,
    realEstateListing,
    characterLimit,
  }: ILocationRealEstateDescriptionQueryData): string {
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
      `Schreibe eine ${
        characterLimit
          ? `maximal ${characterLimit} Zeichen`
          : `etwa ${WORD_LIMIT} Worte`
      } lange Beschreibung der Lage einer Immobilie für Immobilienexposee. Nutze eine ${tonality} Art der ` +
      `Formulierung. Im Fließtext erwähne die Points of Interest nicht mit Zahlen, sondern nur mit Worten "einige, ` +
      `viele, ausreichend, ...". Im Anschluss an den Text füge dann eine Bullet-Liste mit den Zahlen der Points of ` +
      `Interest hinzu. Verwende HTML Zeilenumbrüche.`;

    let queryText = this.getRealEstateDescriptionQuery(
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

  getFormalToInformalQuery(formalText: string): string {
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
}
