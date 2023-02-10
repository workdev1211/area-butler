import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

import { ApiHereLanguageEnum } from '@area-butler-types/here';
import { ApiGoogleLanguageEnum } from '@area-butler-types/google';

@Injectable()
export class AddressLanguagePipe implements PipeTransform {
  transform(language: string): string {
    if (!language) {
      return;
    }

    if (
      !Object.values(ApiHereLanguageEnum).includes(
        language as ApiHereLanguageEnum,
      ) &&
      !Object.values(ApiGoogleLanguageEnum).includes(
        language as ApiGoogleLanguageEnum,
      )
    ) {
      throw new HttpException(
        "Language code should be BCP 47 compliant (e.g., 'de')!",
        400,
      );
    }

    return language;
  }
}
