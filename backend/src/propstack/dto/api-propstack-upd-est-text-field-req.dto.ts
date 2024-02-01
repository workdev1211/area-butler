import { IsIn, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { TAreaButlerExportTypes } from '@area-butler-types/integration-user';
import ApiIntUpdEstTextFieldReqDto from '../../dto/api-int-upd-est-text-field-req.dto';
import { propstackExportTypeMapping } from '../../../../shared/constants/propstack';

@Exclude()
class ApiPropstackUpdEstTextFieldReqDto extends ApiIntUpdEstTextFieldReqDto {
  @Expose()
  @IsNotEmpty()
  @IsIn(Object.keys(propstackExportTypeMapping))
  exportType: TAreaButlerExportTypes;
}

export default ApiPropstackUpdEstTextFieldReqDto;
