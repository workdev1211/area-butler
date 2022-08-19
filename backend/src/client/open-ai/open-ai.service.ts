import { Injectable } from '@nestjs/common';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';

import { configService } from '../../config/config.service';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { MeansOfTransportation, OsmName } from '@area-butler-types/types';
import { openAiTranslationDictionary } from '../../../../shared/constants/open-ai';
import { SearchResultSnapshotDocument } from '../../location/schema/search-result-snapshot.schema';

@Injectable()
export class OpenAiService {
  private readonly openAiApiKey = configService.getOpenAiApiKey();
  private readonly openAiConfig = new Configuration({
    apiKey: this.openAiApiKey,
  });
  private readonly openAiApi = new OpenAIApi(this.openAiConfig);

  prepareLocationDescriptionQuery(
    snapshotDoc: SearchResultSnapshotDocument,
    meanOfTransportation: MeansOfTransportation,
    tonality: string,
  ): string {
    const poiCount: Partial<Record<OsmName, number>> =
      snapshotDoc.snapshot.searchResponse.routingProfiles[
        meanOfTransportation
      ].locationsOfInterest.reduce((result, { entity: { type } }) => {
        if (!result[type]) {
          result[type] = 0;
        }

        result[type] += 1;

        return result;
      }, {});

    let initialOpenAiText =
      `Schreibe eine werbliche, ${tonality} Umgebungsbeschreibung für Immobilien-Anzeige unter Anderem aus den folgenden Daten.\n` +
      'Füge Umgebungsinformationen hinzu:\n' +
      `Adresse: ${snapshotDoc.snapshot.placesLocation.label}\n`;

    snapshotDoc.snapshot.preferredLocations.forEach(
      ({ address: preferredLocation }) => {
        initialOpenAiText += `Verwende dabei einige der folgenden, wichtigen Plätze: ${preferredLocation}\n`;
      },
    );

    return Object.entries(poiCount).reduce((result, [type, count]) => {
      result += `Anzahl ${openAiTranslationDictionary[type].plural}: ${count}\n`;

      return result;
    }, initialOpenAiText);
  }

  async fetchTextCompletion(query: string) {
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

    return choices[0].text;
  }
}
