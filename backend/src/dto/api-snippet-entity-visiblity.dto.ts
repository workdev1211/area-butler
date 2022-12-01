import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiSnippetEntityVisibility, OsmName } from '@area-butler-types/types';

class ApiSnippetEntityVisibilityDto implements ApiSnippetEntityVisibility {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsEnum(OsmName)
  osmName?: OsmName;

  @IsOptional()
  @IsBoolean()
  excluded?: boolean;
}

export default ApiSnippetEntityVisibilityDto;
