import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { FeedbackController } from './feedback/feedback.controller';
import { FeedbackService } from './feedback/feedback.service';
import { Feedback, FeedbackSchema } from './schema/feedback.schema';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
  imports: [
    HttpModule,
    UserModule,
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
})
export class FeedbackModule {}
