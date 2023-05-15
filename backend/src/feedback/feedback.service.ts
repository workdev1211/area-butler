import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Feedback, FeedbackDocument } from './schema/feedback.schema';
import ApiInsertFeedbackDto from '../dto/api-insert-feedback.dto';
import { FeedbackType } from '@area-butler-types/types';
import { UserDocument } from '../user/schema/user.schema';
import {
  SlackChannel,
  SlackSenderService,
} from '../client/slack/slack-sender.service';
import { configService } from '../config/config.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly slackSenderService: SlackSenderService,
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<FeedbackDocument>,
  ) {}

  async postFeedback(
    { id: userId, email: userEmail }: UserDocument,
    { description, type }: ApiInsertFeedbackDto,
  ): Promise<void> {
    const newFeedbackDocument = await new this.feedbackModel({
      userId,
      description,
      type,
    }).save();

    await this.sendFeedbackToSlack(newFeedbackDocument, userEmail);
  }

  private sendFeedbackToSlack(
    feedbackDocument: FeedbackDocument,
    userEmail: string,
  ): void {
    const environmentName = configService.getStripeEnv();

    const textBlocks = [
      'AreaButler Feedback',
      `*Environment:* ${environmentName.toUpperCase()} ${
        environmentName === 'prod' ? ':red_circle:' : ':large_green_circle:'
      }`,
      `*User email:* ${userEmail}`,
      `*Art:* ${FeedbackService.deriveType(feedbackDocument.type)}\n*ID:* ${
        feedbackDocument.id
      }`,
      `*Beschreibung:*\n ${feedbackDocument.description}`,
    ];

    void this.slackSenderService.sendNotification(SlackChannel.FEEDBACK, {
      textBlocks,
    });
  }

  private static deriveType(type: FeedbackType): string {
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
