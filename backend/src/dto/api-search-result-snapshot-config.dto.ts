import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  MeansOfTransportation,
} from '@area-butler-types/types';
import ApiSnippetEntityVisiblityDto from './api-snippet-entity-visiblity.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsOptional, IsArray, IsEnum, IsBoolean, IsIn } from 'class-validator';

class ApiSearchResultSnapshotConfigDto
  implements ApiSearchResultSnapshotConfig
{

  @IsOptional()
  @IsArray()
  defaultActiveGroups?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(MeansOfTransportation, {each: true})
  defaultActiveMeans?: MeansOfTransportation[];

  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ApiSnippetEntityVisiblityDto)
  entityVisibility?: ApiSnippetEntityVisiblityDto[];

  @IsOptional()
  @IsBoolean()
  fixedRealEstates?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  groupItems: boolean;

  @IsOptional()
  mapBoxMapId?: string;

  @IsOptional()
  mapIcon?: string;

  @IsOptional()
  primaryColor?: string;

  @IsNotEmpty()
  @IsBoolean()
  showLocation: boolean;

  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @IsOptional()
  @IsIn(["DEFAULT", "KF"])
  theme?: ApiSearchResultSnapshotConfigTheme;

  @IsOptional()
  @IsBoolean()
  showStreetViewLink?: boolean;
}

export default ApiSearchResultSnapshotConfigDto;
