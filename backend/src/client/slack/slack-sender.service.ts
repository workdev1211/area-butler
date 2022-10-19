import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { configService } from '../../config/config.service';

export interface SlackNotification {
  textBlocks: string[];
}

export enum SlackChannel {
  OPERATIONS = 'OPERATIONS',
  FEEDBACK = 'FEEDBACK',
  REVENUES = 'REVENUES',
}

@Injectable()
export class SlackSenderService {
  private slackChannels: any = {};

  constructor(private readonly http: HttpService) {
    this.slackChannels[SlackChannel.FEEDBACK] =
      configService.getFeedbackSlackWebhook();
    this.slackChannels[SlackChannel.OPERATIONS] =
      configService.getOperationsSlackWebhook();
    this.slackChannels[SlackChannel.REVENUES] =
      configService.getRevenuesSlackWebhook();
  }

  async sendNotification(
    slackChannel: SlackChannel,
    { textBlocks }: SlackNotification,
  ) {
    const blocks = [];

    textBlocks.forEach((textBlock) =>
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: textBlock,
        },
      }),
    );

    if (this.slackChannels[slackChannel]) {
      await firstValueFrom(
        this.http.post(
          this.slackChannels[slackChannel],
          { blocks },
          {
            headers: {
              'Content-type': 'application/json',
            },
          },
        ),
      );
    }
  }
}
