import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SlackChannel,
  SlackSenderService,
} from 'src/client/slack/slack-sender.service';
import { UserDocument } from 'src/user/schema/user.schema';
import { Feedback, FeedbackDocument } from './schema/feedback.schema';
import ApiInsertFeedbackDto from '../dto/api-insert-feedback.dto';
import { FeedbackType } from '@area-butler-types/types';

@Injectable()
export class FeedbackService {
  constructor(
    private slackSender: SlackSenderService,
    @InjectModel(Feedback.name)
    private feedbackModel: Model<FeedbackDocument>,
  ) {}

  public async postFeedback(
    user: UserDocument,
    { description, type }: ApiInsertFeedbackDto,
  ) {
    const newFeedbackDocument = await new this.feedbackModel({
      userId: user.id,
      description,
      type,
    }).save();

    await this.sendFeedbackToSlack(newFeedbackDocument);
  }

  private async sendFeedbackToSlack(feedbackDocument: FeedbackDocument) {
    const textBlocks = [
      'Area-Butler Feedback',
      `*Art:* ${FeedbackService.deriveType(feedbackDocument.type)}\n*ID:* ${
        feedbackDocument.id
      }`,
      `*Beschreibung:*\n ${feedbackDocument.description}`,
    ];

    this.slackSender.sendNotifcation(SlackChannel.FEEDBACK, {
      textBlocks,
    });
  }

  private static deriveType(type: FeedbackType) {
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
