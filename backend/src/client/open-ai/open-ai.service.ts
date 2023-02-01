import { Injectable } from '@nestjs/common';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';

import { configService } from '../../config/config.service';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import {
  ApiSearchResultSnapshot,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import { openAiTranslationDictionary } from '../../../../shared/constants/open-ai';
import { RealEstateListingDocument } from '../../real-estate-listing/schema/real-estate-listing.schema';
import {
  ApiFurnishing,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';

// Was left just in case in order to be able to calculate the number of tokens
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { encode } = require('gpt-3-encoder');
// const usedTokens = encode(queryString).length;

interface ILocationDescriptionQueryData {
  snapshot: ApiSearchResultSnapshot;
  meanOfTransportation: MeansOfTransportation;
  tonality: string;
  customText?: string;
}

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

    const initialOpenAiText =
      `Schreibe eine werbliche, ${tonality} Umgebungsbeschreibung für eine Immobilien-Anzeige an der Adresse ${snapshot.placesLocation.label}.\n` +
      'Füge Umgebungsinformationen hinzu:\n';

    const poiCountEntries = Object.entries(poiCount);

    let openAiQueryText = poiCountEntries.reduce(
      (result, [name, count]: [OsmName, number], i) => {
        result += `Anzahl ${
          count === 1
            ? openAiTranslationDictionary[name].singular
            : openAiTranslationDictionary[name].plural
        }: ${count}${poiCountEntries.length - 1 === i ? '' : '\n'}`;

        return result;
      },
      initialOpenAiText,
    );

    if (customText) {
      openAiQueryText += `\n${customText}`;
    }

    return openAiQueryText;
  }

  getRealEstateDescriptionQuery({
    address,
    characteristics: {
      numberOfRooms,
      energyEfficiency,
      furnishing,
      realEstateSizeInSquareMeters,
      propertySizeInSquareMeters,
    },
    costStructure: { minPrice, price: maxPrice, type: costType },
  }: RealEstateListingDocument): string {
    const maxLength = 200;
    const objectType = 'Haus';

    // Keep in mind that in the future, the currency may not only be the Euro
    const price =
      (!minPrice?.amount && maxPrice?.amount) ||
      (minPrice?.amount && !maxPrice?.amount)
        ? minPrice?.amount || maxPrice?.amount
        : (minPrice?.amount + maxPrice?.amount) / 2;

    let queryText = `Schreibe eine etwa ${maxLength} Worte lange, werbliche Beschreibung in einem Immobilienexposee`;

    switch (objectType) {
      case 'Haus': {
        queryText += ' für ein Haus.';
        break;
      }

      // For future usage
      // case 'Wohnung': {
      //   queryText += ' für eine Wohnung.';
      //   break;
      // }

      default: {
        queryText += ' für ein Objekt.';
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

  async fetchResponseText(query: string): Promise<string> {
    const {
      data: { choices },
    }: AxiosResponse<CreateCompletionResponse> = await this.openAiApi.createCompletion(
      {
        model: 'text-davinci-001',
        prompt: query,
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
