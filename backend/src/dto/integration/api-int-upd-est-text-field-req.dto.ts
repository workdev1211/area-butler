import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { IApiIntUpdEstTextFieldReq } from '@area-butler-types/integration';
import { AreaButlerExportTypesEnum } from '@area-butler-types/integration-user';

@Exclude()
class ApiIntUpdEstTextFieldReqDto implements IApiIntUpdEstTextFieldReq {
  @Expose()
  @IsNotEmpty()
  @IsIn([
    OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
    OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
    OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    AreaButlerExportTypesEnum.INLINE_FRAME,
  ])
  exportType:
    | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
    | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
    | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION
    | AreaButlerExportTypesEnum.INLINE_FRAME;

  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  text: string;
}

export default ApiIntUpdEstTextFieldReqDto;
