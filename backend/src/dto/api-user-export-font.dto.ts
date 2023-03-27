import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

import { IApiUserExportFont } from '@area-butler-types/types';

@Exclude()
class ApiUserExportFontDto implements IApiUserExportFont {
  @Expose()
  @IsNotEmpty()
  @IsString()
  fontFamily: string;

  @Expose()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  fontFaces: string[];
}

export default ApiUserExportFontDto;
