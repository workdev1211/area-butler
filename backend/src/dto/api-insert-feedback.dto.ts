import { ApiInsertFeedback, FeedbackType } from '@area-butler-types/types';
import { IsIn, IsNotEmpty } from 'class-validator';

class ApiInsertFeedbackDto implements ApiInsertFeedback {
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsIn(['ERROR', 'IMPROVEMENT', 'OTHER'])
  type: FeedbackType;
}

export default ApiInsertFeedbackDto;
