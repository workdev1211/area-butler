import { ApiInsertFeedback, FeedbackType } from '@area-butler-types/types';
import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { configService } from 'src/config/config.service';
import { UserDocument } from 'src/user/schema/user.schema';
import { Feedback, FeedbackDocument } from './schema/feedback.schema';

@Injectable()
export class FeedbackService {
  private slackWebhookUrl: string;

  constructor(
    private http: HttpService,
    @InjectModel(Feedback.name)
    private feedbackModel: Model<FeedbackDocument>,
  ) {
    this.slackWebhookUrl = configService.getFeedbackSlackWebhook();
  }

  public async postFeedback(
    user: UserDocument,
    { description, type }: ApiInsertFeedback,
  ) {
    const newFeedbackDocument = await new this.feedbackModel({
      userId: user.id,
      description,
      type,
    }).save();

    await this.sendFeedbackToSlack(newFeedbackDocument);
  }

  private async sendFeedbackToSlack(feedbackDocument: FeedbackDocument) {
    const body = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Area-Butler Feedback',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Art:* ${this.deriveType(feedbackDocument.type)}\n*ID:* ${
              feedbackDocument.id
            }`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Beschreibung:*\n ${feedbackDocument.description}`,
          },
        },
      ],
    };

    return this.http
      .post(this.slackWebhookUrl, body, {
        headers: {
          'Content-type': 'application/json',
        },
      })
      .toPromise();
  }

  private deriveType(type: FeedbackType) {
    switch (type) {
      case 'ERROR':
        return 'Fehler';
      case 'IMPROVEMENT':
        return 'Verbesserung';
      default:
        return 'Sonstiges';
    }
  }
}
