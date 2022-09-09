import { Injectable, Logger } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

import { configService } from '../../config/config.service';

export interface IMailProps {
  to: { name: string; email: string }[];
  cc?: { name: string; email: string }[];
  replyTo?: { name: string; email: string };
  templateId: number;
  params?: Record<string, string>;
}

@Injectable()
export class MailSenderService {
  private readonly logger = new Logger(MailSenderService.name);
  private readonly apiInstance: any;

  constructor() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];

    apiKey.apiKey = configService.getMailProviderApiKey();
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    new SibApiV3Sdk.SendSmtpEmail();
  }

  async sendMail(mailProps: IMailProps) {
    this.logger.log('Sending Mail', mailProps);

    try {
      // if "mailProps" contain several items in the "to" array, then every mail will contain all recipients in the "to" field
      await this.apiInstance.sendTransacEmail(mailProps);
    } catch (err) {
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }
}
