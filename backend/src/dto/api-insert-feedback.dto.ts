import { ApiInsertFeedback, FeedbackType } from '@area-butler-types/types';

class ApiInsertFeedbackDto implements ApiInsertFeedback {
  description: string;
  type: FeedbackType;
}

export default ApiInsertFeedbackDto;
