import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { MyVivendaService } from './my-vivenda.service';
import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { IApiMyVivendaLoginRes } from '@area-butler-types/my-vivenda';
import { MyVivendaHandleLoginInterceptor } from './interceptor/my-vivenda-handle-login.interceptor';
import { InjectSnapshotId } from './inject-snapshot-id.decorator';
import ApiMyVivendaUplMapScreenDto from './dto/api-my-vivenda-upl-map-screen-req.dto';

@ApiTags('my-vivenda')
@Controller('api/my-vivenda')
@UseGuards(AuthGuard('auth0-api'))
export class MyVivendaController {
  private readonly logger = new Logger(MyVivendaController.name);

  constructor(private readonly myVivendaService: MyVivendaService) {}

  @ApiOperation({ description: 'Log in a MyVivenda user' })
  @UseInterceptors(MyVivendaHandleLoginInterceptor)
  @Post('login')
  login(
    @InjectUser() user: UserDocument,
    @InjectSnapshotId() snapshotId: string,
  ): Promise<IApiMyVivendaLoginRes> {
    return this.myVivendaService.login(user, snapshotId);
  }

  @ApiOperation({ description: 'Upload map screenshot' })
  @Post('map-screenshot')
  uploadScreenshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() { base64Image }: ApiMyVivendaUplMapScreenDto,
  ): Promise<void> {
    return this.myVivendaService.uploadMapScreenshot(user, base64Image);
  }
}
