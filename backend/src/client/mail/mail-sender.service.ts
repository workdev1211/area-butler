import { Injectable } from '@nestjs/common';
import { configService } from 'src/config/config.service';

var SibApiV3Sdk = require('sib-api-v3-sdk');

export interface MailProps {
  to: { name: string; email: string }[];
  templateId: number;
  params: Record<string, string>;
}

@Injectable()
export class MailSenderService {
  apiInstance: any;

  constructor() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    
    apiKey.apiKey = configService.getMailProviderApiKey();
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  }

  async sendMail(mailProps: MailProps) {
    console.log('Sending Mail', mailProps);
    try {
      await this.apiInstance.sendTransacEmail(mailProps);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
