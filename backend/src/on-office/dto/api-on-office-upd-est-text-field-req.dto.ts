import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeUpdEstTextFieldReq } from '@area-butler-types/on-office';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import {
  AreaButlerExportTypesEnum,
  TAreaButlerExportTypes,
} from '@area-butler-types/integration-user';

class ApiOnOfficeUpdEstTextFieldReqDto
  implements IApiOnOfficeUpdEstTextFieldReq
{
  @IsNotEmpty()
  @IsIn([
    ...Object.values(OpenAiQueryTypeEnum),
    ...Object.values(AreaButlerExportTypesEnum),
  ])
  exportType: TAreaButlerExportTypes;

  @IsNotEmpty()
  @IsString()
  text: string;
}

export default ApiOnOfficeUpdEstTextFieldReqDto;
