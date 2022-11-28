import { ApiSnippetEntityVisibility } from '@area-butler-types/types';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

class ApiSnippetEntityVisibilityDto implements ApiSnippetEntityVisibility {
  @IsOptional()
  @IsBoolean()
  excluded?: boolean;

  @IsNotEmpty()
  id: string;
}

export default ApiSnippetEntityVisibilityDto;
