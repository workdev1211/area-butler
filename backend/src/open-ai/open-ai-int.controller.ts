import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { OpenAiService } from './open-ai.service';
import ApiOpenAiQueryDto from './dto/api-open-ai-query.dto';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { ProcessOpenAiIntUsageInterceptor } from './interceptor/process-open-ai-int-usage.interceptor';
import ApiOpenAiImproveTextQueryDto from './dto/api-open-ai-improve-text-query.dto';
import ApiOpenAiLocDescQueryDto from './dto/api-open-ai-loc-desc-query.dto';
import ApiOpenAiLocRealEstDescQueryDto from './dto/api-open-ai-loc-real-est-desc-query.dto';
import ApiOpenAiRealEstDescQueryDto from './dto/api-open-ai-real-est-desc-query.dto';
import { OpenAiApiService } from '../client/open-ai/open-ai-api.service';

@ApiTags('open-ai')
@Controller('api/open-ai-int')
export class OpenAiIntController {
  constructor(
    private readonly openAiApiService: OpenAiApiService,
    private readonly openAiService: OpenAiService,
  ) {}

  @ApiOperation({ description: 'Fetch Open AI location description' })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('loc-desc')
  fetchLocDesc(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() locDescQueryDto: ApiOpenAiLocDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchLocDesc(integrationUser, locDescQueryDto);
  }

  @ApiOperation({
    description: 'Fetch Open AI location and real estate description',
  })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('loc-real-est-desc')
  fetchLocRealEstDesc(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    locRealEstDescQueryDto: ApiOpenAiLocRealEstDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchLocRealEstDesc(
      integrationUser,
      locRealEstDescQueryDto,
    );
  }

  @ApiOperation({ description: 'Fetch Open AI real estate description' })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('real-est-desc')
  fetchRealEstDesc(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() realEstDescQueryDto: ApiOpenAiRealEstDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchRealEstDesc(
      integrationUser,
      realEstDescQueryDto,
    );
  }

  @ApiOperation({
    description: 'Fetch Open AI real estate description with image analyzing',
  })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('real-est-desc-2')
  async fetchRealEstDesc2(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() realEstDescQueryDto: ApiOpenAiRealEstDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchRealEstDesc2(
      integrationUser,
      realEstDescQueryDto,
    );
  }

  @ApiOperation({
    description: 'Fetch Open AI text improvement',
  })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('improve-text')
  fetchImprovedText(
    @Body()
    { originalText, customText }: ApiOpenAiImproveTextQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchImprovedText(originalText, customText);
  }

  @ApiOperation({ description: 'Fetch Open AI response' })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('query')
  fetchQuery(
    @Body()
    { text, isFormalToInformal }: ApiOpenAiQueryDto,
  ): Promise<string> {
    return isFormalToInformal
      ? this.openAiService.fetchFormToInform(text)
      : this.openAiApiService.fetchResponse(text);
  }

  @ApiOperation({
    description:
      'Fetch Open AI location and real estate description as a Facebook post',
  })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('facebook-post')
  async fetchFacebookPost(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    locRealEstDescQueryQuery: ApiOpenAiLocRealEstDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchFacebookPost(
      integrationUser,
      locRealEstDescQueryQuery,
    );
  }

  @ApiOperation({
    description:
      'Fetch Open AI location and real estate description as an Instagram caption',
  })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('instagram-caption')
  async fetchInstagramCaption(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body()
    locRealEstDescQueryQuery: ApiOpenAiLocRealEstDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchInstagramCaption(
      integrationUser,
      locRealEstDescQueryQuery,
    );
  }

  @ApiOperation({ description: 'Fetch Open AI macro location description' })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('macro-loc-desc')
  async fetchMacroLocDesc(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() locDescQueryDto: ApiOpenAiLocDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchMacroLocDesc(
      integrationUser,
      locDescQueryDto,
    );
  }

  @ApiOperation({ description: 'Fetch Open AI micro location description' })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('micro-loc-desc')
  async fetchMicroLocDesc(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() locDescQueryDto: ApiOpenAiLocDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchMicroLocDesc(
      integrationUser,
      locDescQueryDto,
    );
  }

  @ApiOperation({ description: 'Fetch Open AI location district description' })
  @UseInterceptors(
    InjectIntegrationUserInterceptor,
    ProcessOpenAiIntUsageInterceptor,
  )
  @Post('district-desc')
  async fetchDistrictDesc(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() locDescQueryDto: ApiOpenAiLocDescQueryDto,
  ): Promise<string> {
    return this.openAiService.fetchDistrictDesc(
      integrationUser,
      locDescQueryDto,
    );
  }
}
