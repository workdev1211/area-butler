import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('on-office', 'webhook')
@Controller('api/on-office-webhook')
export class OnOfficeWebhookController {
  private readonly logger = new Logger(OnOfficeWebhookController.name);

  @ApiOperation({
    description: 'Process the onOffice webhook on the target group change',
  })
  @Post('target-group')
  handleTargetGroupChange(
    @Body() handleTargetGroupChangeDto: any,
    @Req() request: Request,
  ): void {
    this.logger.log(
      'Request',
      request.originalUrl,
      request.params,
      request.query,
      request.body,
    );

    this.logger.log('Request body', handleTargetGroupChangeDto);
  }
}
