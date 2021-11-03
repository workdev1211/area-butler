import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { FederalElectionService } from './federal-election.service';
import { FederalElectionFeature } from './federal-election.types';

@Controller('api/federal-election')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FederalElectionController extends AuthenticatedController {
  constructor(private federalElectionService: FederalElectionService) {
    super();
  }

  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const data: {features: FederalElectionFeature[]} = JSON.parse(file.buffer.toString());
    //TODO: Validate Data
    await this.federalElectionService.createCollection(data.features);
    return 'done';
  }
}
