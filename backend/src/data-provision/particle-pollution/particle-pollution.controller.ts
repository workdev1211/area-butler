import { ApiGeojsonFeature, ApiGeometry } from '@area-butler-types/types';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, Roles } from 'src/auth/roles.decorator';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { ParticlePollutionService } from './particle-pollution.service';

@Controller('api/particle-pollution')
export class ParticlePollutionController extends AuthenticatedController {
  constructor(private particlePollutionService: ParticlePollutionService) {
    super();
  }

  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const data: { features: ApiGeojsonFeature[] } = JSON.parse(
      file.buffer.toString(),
    );
    //TODO: Validate Data
    await this.particlePollutionService.createCollection(data.features);
    return 'done';
  }

  @Post('query')
  async query(@Body() query: ApiGeometry, @InjectUser() user: UserDocument) {
    return await this.particlePollutionService.findIntersecting(query, user);
  }
}
