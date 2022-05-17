import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  HttpService,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SlackChannel, SlackSenderService } from '../client/slack/slack-sender.service';


@Catch()
export class CustomExceptionFilter extends BaseExceptionFilter {
  constructor(private slackSender: SlackSenderService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const req = httpContext.getRequest();
    const res = httpContext.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.error('Error while performing a request');

    if (status === HttpStatus.INTERNAL_SERVER_ERROR || status === HttpStatus.BAD_REQUEST) {
      const headers = { ...req.headers };
      delete headers.authorization;

      const errorTitle = `Error while performing a request - more information in log`;
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
        errorTitle,
        reqUrlDescription,
        reqHeadersDescription,
        reqParamsDescription,
        reqStatusDescription,
        reqMethodDescription,
        reqBodyDescription,
      ];

      console.error(textBlocks);
      console.error(res);

      this.slackSender.sendNotifcation(SlackChannel.OPERATIONS, {
        textBlocks,
      });
    }

    super.catch(exception, host);
  }
}
