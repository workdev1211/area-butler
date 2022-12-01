import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import {
  SlackChannel,
  SlackSenderService,
} from '../client/slack/slack-sender.service';
import { configService } from '../config/config.service';

@Catch()
export class CustomExceptionFilter extends BaseExceptionFilter {
  private readonly logger: Logger = new Logger(CustomExceptionFilter.name);

  constructor(private readonly slackSenderService: SlackSenderService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const req = httpContext.getRequest();
    // const res = httpContext.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error('Error while performing a request');

    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR ||
      status === HttpStatus.BAD_REQUEST
    ) {
      const headers = { ...req.headers };
      delete headers.authorization;
      const environmentName = configService.getStripeEnv();

      const environmentDescription = `*Environment:* ${environmentName.toUpperCase()} ${
        environmentName === 'prod' ? ':red_circle:' : ':large_green_circle:'
      }`;
      const errorTitle =
        'Error while performing a request - more information in log';
      const userEmail = `*User email:* ${req.user?.email}`;
      const reqUrlDescription = `*Request Url:* ${JSON.stringify(req.url)}`;
      const reqStatusDescription = `*Request Status:* ${JSON.stringify(
        status,
      )}`;
      const reqMethodDescription = `*Request Method:* ${JSON.stringify(
        req.method,
      )}`;
      const reqHeadersDescription = `*Request Headers:* ${JSON.stringify(
        headers,
      )}`;
      const reqBodyDescription = `*Request Body:* ${JSON.stringify(req.body)}`;
      const reqParamsDescription = `*Request Params:* ${JSON.stringify(
        req.params,
      )}`;

      const textBlocks = [
        environmentDescription,
        errorTitle,
        userEmail,
        reqUrlDescription,
        reqHeadersDescription,
        reqParamsDescription,
        reqStatusDescription,
        reqMethodDescription,
        reqBodyDescription,
      ];

      this.logger.error(textBlocks);
      this.logger.error(exception);

      void this.slackSenderService.sendNotification(SlackChannel.OPERATIONS, {
        textBlocks,
      });
    }

    super.catch(exception, host);
  }
}
