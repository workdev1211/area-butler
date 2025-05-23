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
import { UserDocument } from '../user/schema/user.schema';
import { IApiMyVivendaLoginRes } from '@area-butler-types/my-vivenda';
import { MyVivendaHandleLoginInterceptor } from './interceptor/my-vivenda-handle-login.interceptor';
import { InjectSnapshotId } from './inject-snapshot-id.decorator';
import ApiUploadFileReqDto from '../dto/api-upload-file-req.dto';

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
  @UseInterceptors(MyVivendaHandleLoginInterceptor)
  @Post('map-screenshot')
  uploadScreenshot(
    @InjectUser() user: UserDocument,
    @Body() { base64Image }: ApiUploadFileReqDto,
  ): Promise<void> {
    return this.myVivendaService.uploadMapScreenshot(user, base64Image);
  }
}
