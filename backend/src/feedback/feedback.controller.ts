import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import ApiInsertFeedbackDto from '../dto/api-insert-feedback.dto';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';

@ApiTags('feedback')
@Controller('api/feedback')
export class FeedbackController extends AuthenticatedController {
  constructor(private feedbackService: FeedbackService) {
    super();
  }

  @ApiOperation({ description: 'Add a new feedback' })
  @Post()
  public async postFeedback(
    @InjectUser() user: UserDocument,
    @Body() feedback: ApiInsertFeedbackDto,
  ) {
    await this.feedbackService.postFeedback(user, feedback);
  }
}
