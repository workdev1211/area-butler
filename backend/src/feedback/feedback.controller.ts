import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { FeedbackService } from './feedback.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import ApiInsertFeedbackDto from '../dto/api-insert-feedback.dto';

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
