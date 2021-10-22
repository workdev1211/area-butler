import { HttpService, Injectable } from '@nestjs/common';
import { configService } from 'src/config/config.service';

export interface SlackNotification {
  textBlocks: string[];
}

export enum SlackChannel {
  OPERATIONS = 'OPERATIONS',
  FEEDBACK = 'FEEDBACK',
}

@Injectable()
export class SlackSenderService {
  slackChannels: any = {};

  constructor(private http: HttpService) {
    this.slackChannels[
      SlackChannel.FEEDBACK
    ] = configService.getFeedbackSlackWebhook();
    this.slackChannels[
      SlackChannel.OPERATIONS
    ] = configService.getOperationsSlackWebhook();
  }

  async sendNotifcation(
    slackChannel: SlackChannel,
    { textBlocks }: SlackNotification,
  ) {
    const blocks = [];

    textBlocks.forEach(textBlock =>
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: textBlock,
        },
      }),
    );

    if (!!this.slackChannels[slackChannel]) {
      await this.http
        .post(this.slackChannels[slackChannel], {blocks}, {
          headers: {
            'Content-type': 'application/json',
          },
        })
        .toPromise();
    }
  }
}
