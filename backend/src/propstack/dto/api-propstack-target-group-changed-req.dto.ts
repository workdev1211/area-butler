import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';

import ApiPropstackLoginReqDto from './api-propstack-login-req.dto';
import { IApiPropstackTargetGroupChangedReq } from '@area-butler-types/propstack';

@Exclude()
class ApiPropstackTargetGroupChangedReqDto
  extends OmitType(ApiPropstackLoginReqDto, ['textFieldType'])
  implements IApiPropstackTargetGroupChangedReq
{
  @Expose()
  @IsNotEmpty()
  @IsString()
  targetGroupName: string;
}

export default ApiPropstackTargetGroupChangedReqDto;
