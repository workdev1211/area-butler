import { ConsoleLogger } from '@nestjs/common';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';

export class CustomLogger extends ConsoleLogger {
  constructor(context: string, options?: ConsoleLoggerOptions) {
    super(context, options);
  }

  info(message: any, ...args: any[]): void {
    super.log(message, ...args);
  }
}
