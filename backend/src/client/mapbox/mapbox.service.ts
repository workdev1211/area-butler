import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { configService } from '../../config/config.service';

const scopes = [
  'styles:tiles',
  'styles:read',
  'fonts:read',
  'datasets:read',
  'vision:read',
];

@Injectable()
export class MapboxService {
  private readonly logger = new Logger(MapboxService.name);
  // TODO move to the config service / env vars
  private readonly tokenCreateUrl =
    'https://api.mapbox.com/tokens/v2/kudiba-tech';
  private readonly tileCache: object = {};

  constructor(private readonly httpService: HttpService) {}

  async createAccessToken(companyId: string): Promise<string> {
    const tokenTitle = `company-token-${companyId}`;

    const body = {
      note: tokenTitle,
      scopes: scopes,
    };

    const tokenCreateUrl = `${
      this.tokenCreateUrl
    }?access_token=${configService.getMapBoxCreateToken()}`;

    try {
      const { token } = (
        await firstValueFrom(
          this.httpService.post<{ token: string }>(tokenCreateUrl, body),
        )
      ).data;

      return token;
    } catch (e) {
      this.logger.error(e);
    }
  }

  async fetchTile(path: string) {
    const url = `https://api.mapbox.com/${path}`;
    const cachedTile = this.tileCache[path];

    if (cachedTile) {
      return cachedTile;
    }

    const tile = (
      await firstValueFrom(
        this.httpService.get(url, { responseType: 'arraybuffer' }),
      )
    ).data;

    this.tileCache[path] = tile;

    return tile;
  }
}
