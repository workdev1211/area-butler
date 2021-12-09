import { HttpService, Injectable } from '@nestjs/common';
import { configService } from 'src/config/config.service';

const scopes = [
  'styles:tiles',
  'styles:read',
  'fonts:read',
  'datasets:read',
  'vision:read',
];

@Injectable()
export class MapboxService {
  tokenCreateUrl = 'https://api.mapbox.com/tokens/v2/kudiba-tech';

  constructor(private http: HttpService) {}

  async createAccessToken(
    userId: string,
    allowedUrls: string[] = [],
  ): Promise<string> {

    const tokenTitle = `user-token-${userId}`;
    const body = {
      note: tokenTitle,
      scopes: scopes,
    };

    const tokenCreateUrl = `${
      this.tokenCreateUrl
    }?access_token=${configService.getMapBoxCreateToken()}`;

    try {
        const { token } = (
          await this.http
            .post<{ token: string }>(tokenCreateUrl, body)
            .toPromise()
        ).data;
        return token;
    } catch (e) {
        console.error(e);
    }
  }
}
