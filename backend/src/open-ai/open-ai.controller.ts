import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { OpenAiService } from './open-ai.service';
import ApiOpenAiQueryDto from './dto/api-open-ai-query.dto';
import { SubscriptionService } from '../user/subscription.service';

// TODO think about moving all external OpenAI methods to the OpenAI controller

@ApiTags('open-ai')
@Controller('api/open-ai')
export class OpenAiController extends AuthenticatedController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly openAiService: OpenAiService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Fetch Open AI response' })
  @Post('query')
  async fetchResponse(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() { text, isFormalToInformal }: ApiOpenAiQueryDto,
  ): Promise<string> {
    // TODO think about moving everything to the UserSubscriptionPipe
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.openAi &&
        !subscriptionPlan.appFeatures.openAi,
      'Das Open AI Feature ist im aktuellen Plan nicht verfügbar',
    );

    const queryText = isFormalToInformal
      ? this.openAiService.getFormToInformQuery(text)
      : text;

    return this.openAiService.fetchResponse(queryText);
  }
}
