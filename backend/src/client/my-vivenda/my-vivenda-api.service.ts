import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { configService } from '../../config/config.service';

@Injectable()
export class MyVivendaApiService {
  private readonly logger = new Logger(MyVivendaApiService.name);
  private readonly apiUrl =
    configService.getSystemEnv() === 'prod' ? 'prod_url' : 'dev_url';

  constructor(private readonly http: HttpService) {}

  async uploadMapScreenshot(
    apiKey: string,
    base64Image: string,
  ): Promise<void> {
    this.logger.verbose('The image has been uploaded.');
    return;

    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const { data } = await firstValueFrom<{ data: void }>(
      this.http.post<void>(
        `${this.apiUrl}/images`,
        { image: base64Image },
        {
          headers,
          maxContentLength: 20971520,
          maxBodyLength: 20971520,
        },
      ),
    );
  }
}
