import { Injectable } from '@nestjs/common';
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
}

interface ILocationRealEstateDescriptionQueryData
  extends ILocationDescriptionQueryData {
  realEstateListing: RealEstateListingDocument;
}

const MAX_CHARACTER_LENGTH = 200;

@Injectable()
export class OpenAiService {
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
      `Schreibe eine werbliche, ${tonality} Umgebungsbeschreibung für eine Immobilien-Anzeige an der Adresse ${snapshot.placesLocation.label}.\n` +
      'Füge Umgebungsinformationen hinzu:\n';

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

    if (customText) {
      queryText += `\n${customText}`;
    }

    return queryText;
  }

  getRealEstateDescriptionQuery(
    {
      address,
      characteristics: {
        numberOfRooms,
        energyEfficiency,
        furnishing,
        realEstateSizeInSquareMeters,
        propertySizeInSquareMeters,
      },
      costStructure: { minPrice, price: maxPrice, type: costType },
    }: RealEstateListingDocument,
    initialQueryText = `Schreibe eine etwa ${MAX_CHARACTER_LENGTH} Worte lange, werbliche Beschreibung in einem Immobilienexposee.`,
  ): string {
    const objectType = 'Haus';

    // Keep in mind that in the future, the currency may not only be the Euro
    const price =
      (!minPrice?.amount && maxPrice?.amount) ||
      (minPrice?.amount && !maxPrice?.amount)
        ? minPrice?.amount || maxPrice?.amount
        : (minPrice?.amount + maxPrice?.amount) / 2;

    let queryText = initialQueryText;

    switch (objectType) {
      case 'Haus': {
        queryText += ' Das Exposee ist für ein Haus.';
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
    if (propertySizeInSquareMeters) {
      queryText += ` Zu den Objekt gehört ein Grundstück mit einer Fläche von ${propertySizeInSquareMeters}qm.`;
    }
    if (realEstateSizeInSquareMeters) {
      queryText += ` Die Wohnfläche beträgt ${realEstateSizeInSquareMeters}qm.`;
    }
    if (numberOfRooms) {
      queryText += ` Es gibt ${numberOfRooms} Zimmer.`;
    }
    if (energyEfficiency) {
      queryText += ` Die Energieeffizienzklasse des Objektes ist '${energyEfficiency}'.`;
    }
    if (furnishing.includes(ApiFurnishing.GARDEN)) {
      queryText += ' Es gibt einen Garten.';
    }
    if (furnishing.includes(ApiFurnishing.BALCONY)) {
      queryText += ' Das Objekt verfügt über einen Balkon.';
    }
    if (furnishing.includes(ApiFurnishing.BASEMENT)) {
      queryText += ' Zu dem Objekt gehört ein Keller.';
    }
    if (furnishing.includes(ApiFurnishing.GUEST_REST_ROOMS)) {
      queryText += ' Es gibt ein Gäste-WC.';
    }
    if (furnishing.includes(ApiFurnishing.UNDERFLOOR_HEATING)) {
      queryText += ' Bei der Heizung handelt es sich um ein Fußbodenheizung.';
    }
    if (furnishing.includes(ApiFurnishing.GARAGE_PARKING_SPACE)) {
      queryText += ' Zugehörig gibt es einen Stellplatz.';
    }
    if (furnishing.includes(ApiFurnishing.ACCESSIBLE)) {
      queryText += ' Das Objekt ist barrierefrei eingerichtet und zugänglich.';
    }
    if (furnishing.includes(ApiFurnishing.FITTED_KITCHEN)) {
      queryText += ' Das Objekt verfügt über eine Einbauküche.';
    }

    return `${queryText}\n\n`;
  }

  getLocationRealEstateDescriptionQuery({
    snapshot,
    meanOfTransportation,
    tonality,
    customText,
    realEstateListing,
  }: ILocationRealEstateDescriptionQueryData) {
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

    let queryText = this.getRealEstateDescriptionQuery(
      realEstateListing,
      `Schreibe eine etwa ${MAX_CHARACTER_LENGTH} Worte lange, werbliche Beschreibung in einem Immobilienexposee. Nutze eine ${tonality} Art der Formulierung.`,
    ).replace('\n\n', '');

    if (poiCount[OpenAiOsmQueryNameEnum.PUBLIC_TRANSPORT]) {
      queryText += ` Es gibt ${
        poiCount[OpenAiOsmQueryNameEnum.PUBLIC_TRANSPORT]
      } Haltestellen des ÖPNV in der Nähe.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.HIGHWAY_ACCESS]) {
      queryText += ` Mit ${
        poiCount[OpenAiOsmQueryNameEnum.HIGHWAY_ACCESS]
      } erreichbaren Autobahnauffahrten kommen Sie schnell überall hin.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.CHARGING_STATIONS]) {
      queryText += ` Sie finden ${
        poiCount[OpenAiOsmQueryNameEnum.CHARGING_STATIONS]
      } E-Ladestellen in der Nähe.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.GAS_STATIONS]) {
      queryText += ` Im Umkreis befinden sich ${
        poiCount[OpenAiOsmQueryNameEnum.GAS_STATIONS]
      } Tankstellen.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SUPERMARKETS_AND_DRUGSTORES]) {
      queryText += ` Die Nahversorgung wird durch ${
        poiCount[OpenAiOsmQueryNameEnum.SUPERMARKETS_AND_DRUGSTORES]
      } Supermärkte und Drogerien sichergestellt.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SCHOOLS_AND_KINDERGARDEN]) {
      queryText += ` Es gibt ${
        poiCount[OpenAiOsmQueryNameEnum.SCHOOLS_AND_KINDERGARDEN]
      } in der Nähe`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.UNIVERSITIES]) {
      queryText += ` Die Erwachsenenbildung wird du ${
        poiCount[OpenAiOsmQueryNameEnum.UNIVERSITIES]
      } Univerität(en) sichergestellt.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.PLAYGROUNDS_AND_PARKS]) {
      queryText += ` Zur Naherholung finden Sie ${
        poiCount[OpenAiOsmQueryNameEnum.PLAYGROUNDS_AND_PARKS]
      } Spielplätze und Parks in der Nähe.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.BARS_AND_RESTAURANTS]) {
      queryText += ` Es befinden sich ${
        poiCount[OpenAiOsmQueryNameEnum.BARS_AND_RESTAURANTS]
      } Bars und Restaurants im Umkreis.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.THEATERS]) {
      queryText += ` Das Kulturangebot umfasst ${
        poiCount[OpenAiOsmQueryNameEnum.THEATERS]
      } Theater.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SPORTS]) {
      queryText += ` Sie finden ${
        poiCount[OpenAiOsmQueryNameEnum.SPORTS]
      } Angebote aus dem Bereich Sport.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SWIMMING_POOLS]) {
      queryText += ` Die Anzahl der Schwimmbäder beläuft sich auf ${
        poiCount[OpenAiOsmQueryNameEnum.SWIMMING_POOLS]
      }.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.DOCTORS]) {
      queryText += ` Die medizinische Versorgung wird duch ${
        poiCount[OpenAiOsmQueryNameEnum.DOCTORS]
      } Ärzte gewährleistet.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.PHARMACIES]) {
      queryText += ` Es befinden sich ${
        poiCount[OpenAiOsmQueryNameEnum.PHARMACIES]
      } Apotheken im näheren Umfeld.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.HOSPITALS]) {
      queryText += ` Für Ernstfälle stehen ${
        poiCount[OpenAiOsmQueryNameEnum.HOSPITALS]
      } Krankenhäuser gut erreichbar zur Verfügung.`;
    }
    if (poiCount[OpenAiOsmQueryNameEnum.SIGHTS]) {
      queryText += ` Falls Besuch auftaucht sind ${
        poiCount[OpenAiOsmQueryNameEnum.SIGHTS]
      } Sehenswürdigkeiten gut erreichbar.`;
    }

    if (customText) {
      queryText += `\n${customText}`;
    }

    return queryText + '\n\n';
  }

  getFormalToInformalQuery(formalText: string) {
    return `Ersetze im folgenden text die formale Sie-Form durch die informale Du-Form: \n\n ${formalText}`;
  }

  async fetchResponse(queryText: string): Promise<string> {
    const {
      data: { choices },
    }: AxiosResponse<CreateCompletionResponse> = await this.openAiApi.createCompletion(
      {
        model: 'text-davinci-001',
        prompt: queryText,
        temperature: 1,
        max_tokens: 1200,
        top_p: 1,
        n: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    );

    return choices[0].text.replace(/^(\n)*(.*)/g, '$2');
  }
}
