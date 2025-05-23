import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
// import { encoding_for_model, Tiktoken } from '@dqbd/tiktoken';
import { configService } from '../../config/config.service';
import { LanguageTypeEnum } from '@area-butler-types/types';
import { TGeneralImage } from '../../shared/types/shared';

const MODEL_NAME = 'gpt-4o';

interface IResponseCompressed {
  maxCharactersLength: number;
  language: LanguageTypeEnum;
}

@Injectable()
export class OpenAiApiService {
  private readonly logger = new Logger(OpenAiApiService.name);
  private readonly openAiApiKey = configService.getOpenAiApiKey();
  private readonly openAiApi = new OpenAI({ apiKey: this.openAiApiKey });
  private readonly systemEnv = configService.getSystemEnv();

  async fetchResponse(
    queryText: string,
    responseCompressedParams?: IResponseCompressed,
    images: TGeneralImage[] = [],
  ): Promise<string> {
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
    const imageList: OpenAI.ChatCompletionContentPartImage[] = images.map(
      (image) => ({
        type: 'image_url',
        image_url: {
          url: image.url,
          detail: 'high',
        },
      }),
    );

    const { choices }: OpenAI.ChatCompletion =
      await this.openAiApi.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content:
              'Du bist Texter/in in einer Immobilienagentur. Du schreibst kreative und korrekte Beschreibungen von Immobilienangeboten und deren Umgebung',
          },
          {
            role: 'user',
            content: [{ type: 'text', text: queryText }, ...imageList],
          },
        ],
        temperature: 1,
        top_p: 1,
        n: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

    let response = choices[0]['message']['content'].replace(
      /^(\n)*(.*)/g,
      '$2',
    );

    if (
      responseCompressedParams &&
      response.length > responseCompressedParams.maxCharactersLength
    ) {
      const maxCharactersLength =
        responseCompressedParams?.maxCharactersLength - 50;
      const query =
        `Fasse den folgenden Text so zusammen, dass er nicht länger als ${
          maxCharactersLength > 50 ? maxCharactersLength : 50
        } Zeichen lang ist! Lasse die Tonalität hierbei unverändert.\n` +
        ` Verwende als Ausgabesprache ${responseCompressedParams.language} (BCP 47).` +
        response;

      response = await this.fetchResponse(query);
    }

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
