import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';
import { UserDocument } from '../user/schema/user.schema';
import ApiOpenAiExtQueryReqDto from './dto/api-open-ai-ext-query-req.dto';
import { ResultStatusEnum } from '@area-butler-types/types';
import {
  ApiUsageStatsTypesEnum,
  IApiOpenAiExtQueryReqStatus,
  IOpenAiExtQueryRes,
} from '../shared/types/external-api';
import { UsageStatisticsService } from '../user/service/usage-statistics.service';
import { OpenAiExtService } from './open-ai-ext.service';

@ApiTags('open-ai', 'api')
@Controller('api/open-ai-ext')
export class OpenAiExtController extends ApiKeyAuthController {
  constructor(
    private readonly openAiExtService: OpenAiExtService,
    private readonly usageStatisticsService: UsageStatisticsService,
  ) {
    super();
  }

  @ApiOperation({ description: 'Fetch Open AI response' })
  @Get('query')
  async fetchQuery(
    @InjectUser() user: UserDocument,
    @Query()
    openAiQueryReqDto: ApiOpenAiExtQueryReqDto,
  ): Promise<IOpenAiExtQueryRes | string> {
    const requestStatus: IApiOpenAiExtQueryReqStatus = {
      status: ResultStatusEnum.SUCCESS,
      queryParams: openAiQueryReqDto,
    };

    try {
      const { coordinates, queryResp } =
        await this.openAiExtService.fetchExtQuery(user, openAiQueryReqDto);

      Object.assign(requestStatus, { coordinates });

      return {
        input: { coordinates },
        result: queryResp,
      };
    } catch (e) {
      requestStatus.status = ResultStatusEnum.FAILURE;
      requestStatus.message = e.message;

      if (e.response?.status === 429 && !(e instanceof HttpException)) {
        throw new HttpException(
          'Too many requests at a time! Please, try again later.',
          429,
        );
      }

      throw e;
    } finally {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiUsageStatsTypesEnum.OPEN_AI,
        requestStatus,
      );
    }
  }
}
