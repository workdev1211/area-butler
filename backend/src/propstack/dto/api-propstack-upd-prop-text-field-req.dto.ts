import { IsIn, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { TOpenAiLocDescType } from '@area-butler-types/open-ai';
import { IApiPropstackUpdEstTextFieldReq } from '@area-butler-types/propstack';
import ApiIntUpdEstTextFieldReqDto from '../../dto/integration/api-int-upd-est-text-field-req.dto';
import { openAiLocDescTypes } from '../../../../shared/constants/open-ai';

@Exclude()
class ApiPropstackUpdPropTextFieldReqDto
  extends ApiIntUpdEstTextFieldReqDto
  implements IApiPropstackUpdEstTextFieldReq
{
  @Expose()
  @IsNotEmpty()
  @IsIn(openAiLocDescTypes)
  exportType: TOpenAiLocDescType;
}

export default ApiPropstackUpdPropTextFieldReqDto;
