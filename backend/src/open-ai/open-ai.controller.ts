import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { OpenAiService } from './open-ai.service';
import ApiOpenAiQueryDto from './dto/api-open-ai-query.dto';
import { SubscriptionService } from '../user/subscription.service';
import ApiOpenAiImproveTextQueryDto from './dto/api-open-ai-improve-text-query.dto';
import ApiOpenAiLocDescQueryDto from './dto/api-open-ai-loc-desc-query.dto';
import ApiOpenAiLocRealEstDescQueryDto from './dto/api-open-ai-loc-real-est-desc-query.dto';
import ApiOpenAiRealEstDescQueryDto from './dto/api-open-ai-real-est-desc-query.dto';
import { OpenAiApiService } from '../client/open-ai/open-ai-api.service';

@ApiTags('open-ai')
@Controller('api/open-ai')
export class OpenAiController extends AuthenticatedController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly openAiApiService: OpenAiApiService,
    private readonly openAiService: OpenAiService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Fetch Open AI location description' })
  @Post('loc-desc')
  async fetchLocDesc(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() locDescQueryDto: ApiOpenAiLocDescQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);
    return this.openAiService.fetchLocDesc(user, locDescQueryDto);
  }

  @ApiOperation({
    description: 'Fetch Open AI location and real estate description',
  })
  @Post('loc-real-est-desc')
  async fetchLocRealEstDesc(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    locRealEstDescQueryDto: ApiOpenAiLocRealEstDescQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);
    return this.openAiService.fetchLocRealEstDesc(user, locRealEstDescQueryDto);
  }

  @ApiOperation({ description: 'Fetch Open AI real estate description' })
  @Post('real-est-desc')
  async fetchRealEstDesc(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() realEstDescQueryDto: ApiOpenAiRealEstDescQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);
    return this.openAiService.fetchRealEstDesc(user, realEstDescQueryDto);
  }

  @ApiOperation({
    description: 'Fetch Open AI text improvement',
  })
  @Post('improve-text')
  async fetchImprovedText(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() { originalText, customText }: ApiOpenAiImproveTextQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);
    return this.openAiService.fetchImprovedText(originalText, customText);
  }

  @ApiOperation({ description: 'Fetch Open AI response' })
  @Post('query')
  async fetchQuery(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() { text, isFormalToInformal }: ApiOpenAiQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);

    return isFormalToInformal
      ? this.openAiService.fetchFormToInform(text)
      : this.openAiApiService.fetchResponse(text);
  }

  @ApiOperation({
    description:
      'Fetch Open AI location and real estate description as a Facebook post',
  })
  @Post('facebook-post')
  async fetchFacebookPost(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    locRealEstDescQueryQuery: ApiOpenAiLocRealEstDescQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);
    return this.openAiService.fetchFacebookPost(user, locRealEstDescQueryQuery);
  }

  @ApiOperation({
    description:
      'Fetch Open AI location and real estate description as an Instagram caption',
  })
  @Post('instagram-caption')
  async fetchInstagramCaption(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    locRealEstDescQueryQuery: ApiOpenAiLocRealEstDescQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);

    return this.openAiService.fetchInstagramCaption(
      user,
      locRealEstDescQueryQuery,
    );
  }

  @ApiOperation({ description: 'Fetch Open AI macro location description' })
  @Post('macro-loc-desc')
  async fetchMacroLocDesc(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() locDescQueryDto: ApiOpenAiLocDescQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);
    return this.openAiService.fetchMacroLocDesc(user, locDescQueryDto);
  }

  @ApiOperation({ description: 'Fetch Open AI micro location description' })
  @Post('micro-loc-desc')
  async fetchMicroLocDesc(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() locDescQueryDto: ApiOpenAiLocDescQueryDto,
  ): Promise<string> {
    this.checkIsOpenAiAvail(user);
    return this.openAiService.fetchMicroLocDesc(user, locDescQueryDto);
  }

  // TODO think about moving the check to the UserSubscriptionPipe
  private checkIsOpenAiAvail(user: UserDocument): void {
    this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.openAi &&
        !subscriptionPlan.appFeatures.openAi,
      'Das Open AI Feature ist im aktuellen Plan nicht verfügbar',
    );
  }
}
