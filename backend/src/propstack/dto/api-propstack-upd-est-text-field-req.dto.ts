import { IsIn, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { AreaButlerExportTypesEnum } from '@area-butler-types/integration-user';
import { IApiPropstackUpdEstTextFieldReq } from '@area-butler-types/propstack';
import ApiIntUpdEstTextFieldReqDto from '../../dto/integration/api-int-upd-est-text-field-req.dto';

@Exclude()
class ApiPropstackUpdEstTextFieldReqDto
  extends ApiIntUpdEstTextFieldReqDto
  implements IApiPropstackUpdEstTextFieldReq
{
  @Expose()
  @IsNotEmpty()
  @IsIn([
    OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
    OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
    OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS,
    AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS,
  ])
  exportType:
    | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
    | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
    | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS
    | AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS;
}

export default ApiPropstackUpdEstTextFieldReqDto;
