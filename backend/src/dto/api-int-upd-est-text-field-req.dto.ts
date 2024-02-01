import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import {
  AreaButlerExportTypesEnum,
  TAreaButlerExportTypes,
} from '@area-butler-types/integration-user';
import { IApiIntUpdEstTextFieldReq } from '@area-butler-types/integration';

@Exclude()
class ApiIntUpdEstTextFieldReqDto implements IApiIntUpdEstTextFieldReq {
  @Expose()
  @IsNotEmpty()
  @IsIn([
    ...Object.values(OpenAiQueryTypeEnum),
    ...Object.values(AreaButlerExportTypesEnum),
  ])
  exportType: TAreaButlerExportTypes;

  @Expose()
  @IsNotEmpty()
  @IsString()
  text: string;
}

export default ApiIntUpdEstTextFieldReqDto;
