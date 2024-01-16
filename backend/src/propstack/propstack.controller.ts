import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PropstackService } from './propstack.service';
import { PropstackConnectGuard } from '../auth/propstack-connect.guard';
import ApiPropstackConnectReqDto from './dto/api-propstack-connect-req.dto';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { InjectUser } from '../user/inject-user.decorator';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import ApiPropstackLoginReqDto from './dto/api-propstack-login-req.dto';
import { IApiIntUserLoginRes } from '@area-butler-types/integration-user';

@ApiTags('propstack')
@Controller('api/propstack')
export class PropstackController {
  private readonly logger = new Logger(PropstackController.name);

  constructor(private readonly propstackService: PropstackService) {}

  @ApiOperation({ description: 'Connect a Propstack user' })
  @Post('connect')
  @UseGuards(PropstackConnectGuard)
  @HttpCode(HttpStatus.CREATED)
  connect(@Body() connectData: ApiPropstackConnectReqDto): Promise<void> {
    this.logger.debug(
      `${PropstackController.name} / ${this.connect.name}`,
      connectData,
    );

    return this.propstackService.connect(connectData);
  }

  @ApiOperation({ description: 'Log in a Propstack user' })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() loginData: ApiPropstackLoginReqDto,
  ): Promise<IApiIntUserLoginRes> {
    this.logger.debug(
      `${PropstackController.name} / ${this.login.name}`,
      loginData,
    );

    return this.propstackService.login(integrationUser, loginData);
  }
}
