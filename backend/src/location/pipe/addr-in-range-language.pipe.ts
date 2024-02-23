import { HttpException, Injectable, PipeTransform } from '@nestjs/common';
import { Language } from '@googlemaps/google-maps-services-js';

import { ApiHereLanguageEnum } from '../../shared/types/here';

@Injectable()
export class AddrInRangeLanguagePipe implements PipeTransform {
  transform(language: string): string {
    if (!language) {
      return;
    }

    if (
      !Object.values(ApiHereLanguageEnum).includes(
        language as ApiHereLanguageEnum,
      ) &&
      !Object.values(Language).includes(language as Language)
    ) {
      throw new HttpException(
        "Language code should be BCP 47 compliant (e.g., 'de')!",
        400,
      );
    }

    return language;
  }
}
