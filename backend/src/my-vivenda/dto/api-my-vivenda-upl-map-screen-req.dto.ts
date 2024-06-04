import { IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IsBase64Image } from '../../shared/decorators/is-base64-image.decorator';
import { IApiMyVivendaUplMapScreenReq } from '@area-butler-types/my-vivenda';

@Exclude()
class ApiMyVivendaUplMapScreenDto implements IApiMyVivendaUplMapScreenReq {
  @Expose()
  @IsNotEmpty()
  @IsBase64Image()
  base64Image: string;
}

export default ApiMyVivendaUplMapScreenDto;
