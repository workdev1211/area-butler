import { IsIn, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { IApiPropstackUpdEstTextFieldReq } from '@area-butler-types/propstack';
import ApiIntUpdEstTextFieldReqDto from '../../dto/integration/api-int-upd-est-text-field-req.dto';

@Exclude()
class ApiPropstackUpdPropTextFieldReqDto
  extends ApiIntUpdEstTextFieldReqDto
  implements IApiPropstackUpdEstTextFieldReq
{
  @Expose()
  @IsNotEmpty()
  @IsIn([
    OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
    OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
    OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
  ])
  exportType:
    | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
    | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
    | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION;
}

export default ApiPropstackUpdPropTextFieldReqDto;
