import { ApiSnippetEntitVisiblity } from '@area-butler-types/types';

class ApiSnippetEntityVisiblityDto implements ApiSnippetEntitVisiblity {
  excluded?: boolean;
  id: string;
}

export default ApiSnippetEntityVisiblityDto;
