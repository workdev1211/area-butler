import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

import { ApiHereLanguageEnum } from '../../../../shared/constants/here';
import { ApiGoogleLanguageEnum } from '../../../../shared/constants/google';

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
