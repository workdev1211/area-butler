import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientModule } from 'src/client/client.module';
import { UserModule } from 'src/user/user.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback, FeedbackSchema } from './schema/feedback.schema';

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
