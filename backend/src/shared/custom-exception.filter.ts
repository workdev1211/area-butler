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

  catch(exception: any, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const req = httpContext.getRequest();
    // const res = httpContext.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error('Error while performing a request');
    this.logger.debug(exception);

    if (
      ![HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.BAD_REQUEST].includes(
        status,
      )
    ) {
      super.catch(exception, host);
      return;
    }

    const headers = { ...req.headers };
    delete headers.authorization;
    const environmentName = configService.getStripeEnv();
    const responseMessage = exception?.response?.message;

    const environmentDescription = `*Environment:* ${environmentName.toUpperCase()} ${
      environmentName === 'prod' ? ':red_circle:' : ':large_green_circle:'
    }`;
    const errorTitle =
      exception?.message ||
      'Error while performing a request - more information is in the log';

    const textBlocks = [environmentDescription, errorTitle];

    const errorMessage = responseMessage
      ? `*Error message:* ${
          Array.isArray(responseMessage)
            ? `\n  ${responseMessage.join('\n  ')}\n`
            : responseMessage
        }`
      : undefined;

    if (errorMessage) {
      textBlocks.push(errorMessage);
    }

    const userEmail = `*User email:* ${req.user?.email}`;
    const reqUrlDescription = `*Request Url:* ${JSON.stringify(req.url)}`;
    const reqStatusDescription = `*Request Status:* ${JSON.stringify(status)}`;
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

    textBlocks.push(
      userEmail,
      reqUrlDescription,
      reqHeadersDescription,
      reqParamsDescription,
      reqStatusDescription,
      reqMethodDescription,
      reqBodyDescription,
    );

    console.error(textBlocks);

    // TODO uncomment on deploy
    // void this.slackSenderService.sendNotification(SlackChannel.OPERATIONS, {
    //   textBlocks,
    // });

    super.catch(exception, host);
  }
}
