import { ApiSnippetEntitVisiblity } from '@area-butler-types/types';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

class ApiSnippetEntityVisiblityDto implements ApiSnippetEntitVisiblity {

  @IsOptional()
  @IsBoolean()
  excluded?: boolean;

  @IsNotEmpty()
  id: string;
}

export default ApiSnippetEntityVisiblityDto;
