import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiUnlockIntProductReq } from '@area-butler-types/integration';
import {
  OnOfficeIntActTypesEnum,
  TOnOfficeIntActTypes,
} from '@area-butler-types/on-office';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';

@Exclude()
class ApiUnlockIntProductReqDto implements IApiUnlockIntProductReq {
  @Expose()
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;

  @Expose()
  @IsNotEmpty()
  @IsIn([
    ...Object.values(OpenAiQueryTypeEnum),
    ...Object.values(OnOfficeIntActTypesEnum),
  ])
  actionType: TOnOfficeIntActTypes;
}

export default ApiUnlockIntProductReqDto;
