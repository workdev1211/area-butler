import { Injectable } from '@nestjs/common';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';

import { configService } from '../../config/config.service';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import {
  ApiSearchResultSnapshot,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import {
  openAiTextLength,
  openAiTranslationDictionary,
} from '../../../../shared/constants/open-ai';
import { OpenAiTextLengthEnum } from '@area-butler-types/open-ai';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { encode } = require('gpt-3-encoder');

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
      ].locationsOfInterest.reduce((result, { entity: { type } }) => {
        if (!result[type]) {
          result[type] = 0;
        }

        result[type] += 1;

        return result;
      }, {});

    const initialOpenAiText =
      `Schreibe eine werbliche, ${tonality} Umgebungsbeschreibung für Immobilien-Anzeige unter Anderem aus den folgenden Daten.${
        customText ? ` ${customText}` : ''
      }\n` +
      'Füge Umgebungsinformationen hinzu:\n' +
      `Adresse: ${snapshot.placesLocation.label}\n`;

    // TODO wait for the change from Philipp
    // snapshotDoc.snapshot.preferredLocations.forEach(
    //   ({ address: preferredLocation }) => {
    //     initialOpenAiText += `Verwende dabei einige der folgenden, wichtigen Plätze: ${preferredLocation}\n`;
    //   },
    // );

    return Object.entries(poiCount).reduce((result, [type, count]) => {
      result += `Anzahl ${openAiTranslationDictionary[type].plural}: ${count}\n`;

      return result;
    }, initialOpenAiText);
  }

  async fetchTextCompletion(
    query: string,
    maxTokens = openAiTextLength[OpenAiTextLengthEnum.MEDIUM].value,
  ): Promise<string> {
    const usedTokens = encode(query).length;
    const resultingMaxTokens = maxTokens - usedTokens;

    if (resultingMaxTokens < 100) {
      // TODO refactor the throwing Error algorithm
      // The frontend should be getting the right error message
      return;
    }

    const {
      data: { choices },
    }: AxiosResponse<CreateCompletionResponse> = await this.openAiApi.createCompletion(
      {
        model: 'text-davinci-001',
        prompt: query,
        temperature: 1,
        max_tokens: resultingMaxTokens,
        top_p: 1,
        n: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    );

    return choices[0].text;
  }
}
