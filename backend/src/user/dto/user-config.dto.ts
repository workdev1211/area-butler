import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { IUserConfig } from '@area-butler-types/user';
import ApiUserExtConnectionsDto from './api-user-ext-connections.dto';
import {
  LanguageTypeEnum,
  TApiUserExtConnections,
  TApiUserStudyTours,
} from '@area-butler-types/types';
import ApiUserStudyToursDto from './api-user-study-tours.dto';

@Exclude()
class UserConfigDto implements IUserConfig {
  @Expose()
  @Transform(
    ({ value }: { value: LanguageTypeEnum }): LanguageTypeEnum =>
      value || LanguageTypeEnum.de,
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsEnum(LanguageTypeEnum)
  language: LanguageTypeEnum;

  @Expose()
  @Type(() => ApiUserStudyToursDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  studyTours: TApiUserStudyTours;

  @Expose()
  @Type(() => ApiUserExtConnectionsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  externalConnections?: TApiUserExtConnections;

  @Expose()
  @IsOptional()
  @IsString()
  fullname?: string;

  @Expose()
  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default UserConfigDto;
