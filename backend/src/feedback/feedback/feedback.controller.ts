import { ApiInsertFeedback } from '@area-butler-types/types';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { User, UserDocument } from 'src/user/schema/user.schema';
import { FeedbackService } from './feedback.service';

@Controller('api/feedback')
export class FeedbackController extends AuthenticatedController{
    constructor(private feedbackService: FeedbackService) {
        super();
    }


    @Post()
    public async postFeedback(@InjectUser() user: UserDocument, @Body() feedback: ApiInsertFeedback) {
        await this.feedbackService.postFeedback(user, feedback);
    }
}
