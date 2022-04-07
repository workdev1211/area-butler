import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback, FeedbackSchema } from './schema/feedback.schema';
import { HttpModule } from '@nestjs/axios';
import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
  imports: [
    ClientModule,
    HttpModule,
    UserModule,
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
})
export class FeedbackModule {}
