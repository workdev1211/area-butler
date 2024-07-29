import { Injectable, Logger } from '@nestjs/common';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
// import { encoding_for_model, Tiktoken } from '@dqbd/tiktoken';

import { configService } from '../../config/config.service';

const MODEL_NAME = 'gpt-4o';

@Injectable()
export class OpenAiApiService {
  private readonly logger = new Logger(OpenAiApiService.name);
  private readonly openAiApiKey = configService.getOpenAiApiKey();
  private readonly openAiConfig = new Configuration({
    apiKey: this.openAiApiKey,
  });
  private readonly openAiApi = new OpenAIApi(this.openAiConfig);
  private readonly systemEnv = configService.getSystemEnv();

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
}
