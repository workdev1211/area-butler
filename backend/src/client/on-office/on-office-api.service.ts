import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OnOfficeApiService {
  private readonly apiUrl = 'https://api.onoffice.de/api/stable/api.php';

  constructor(private readonly http: HttpService) {}

  async sendRequest<T = unknown, U = unknown>(requestBody: T): Promise<U> {
    const { data } = await firstValueFrom<{
      data: U;
    }>(
      this.http.post<U>(this.apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    return data;
  }
}
