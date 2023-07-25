import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { OpenAiService } from './open-ai.service';
import ApiOpenAiQueryDto from './dto/api-open-ai-query.dto';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { ProcessOpenAiIntUsageInterceptor } from '../real-estate-listing/interceptor/process-open-ai-int-usage.interceptor';

@ApiTags('open-ai')
@Controller('api/open-ai-int')
export class OpenAiIntController {
  constructor(private readonly openAiService: OpenAiService) {}

  @ApiOperation({ description: 'Fetch Open AI response' })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('query')
  async fetchResponse(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    { text, isFormalToInformal }: ApiOpenAiQueryDto,
  ): Promise<string> {
    const queryText = isFormalToInformal
      ? this.openAiService.getFormToInformQuery(text)
      : text;

    return this.openAiService.fetchResponse(queryText);
  }
}
