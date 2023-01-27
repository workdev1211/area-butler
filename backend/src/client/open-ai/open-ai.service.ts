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

  getLocationDescriptionQueryText({
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

  async fetchTextCompletion(query: string): Promise<string> {
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
