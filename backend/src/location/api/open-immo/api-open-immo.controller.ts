import {
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { InjectUser } from '../../../user/inject-user.decorator';
import { ApiGuard } from '../../api.guard';
import { ApiOpenImmoService } from './api-open-immo.service';
import { UserSubscriptionPipe } from '../../../pipe/user-subscription.pipe';
import { UserDocument } from '../../../user/schema/user.schema';

@ApiTags('api-open-immo')
@Controller('api/open-immo')
@UseGuards(AuthGuard('auth0-api'), ApiGuard)
export class ApiOpenImmoController {
  constructor(private readonly openImmoService: ApiOpenImmoService) {}

  @ApiOperation({
    description: 'Imports the OpenImmo data received in XML format',
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('import-xml')
  async importOpenImmoXmlData(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HttpStatus> {
    await this.openImmoService.importXmlFile(user, file);
    return HttpStatus.OK;
  }
}
