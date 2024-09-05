import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiFederalElectionFeature } from '@area-butler-types/federal-election';
import { FederalElectionService } from './federal-election.service';
import FileUploadDto from '../../dto/file-upload.dto';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { Roles, Role } from '../../auth/role/roles.decorator';
import { RolesGuard } from '../../auth/role/roles.guard';
import { AuthenticatedController } from '../../shared/authenticated.controller';
import { InjectUser } from '../../user/inject-user.decorator';
import { UserDocument } from '../../user/schema/user.schema';
import { FederalElectionDocument } from '../schemas/federal-election.schema';

@ApiTags('federal-election')
@Controller('api/federal-election')
@UseGuards(RolesGuard)
export class FederalElectionController extends AuthenticatedController {
  constructor(private readonly federalElectionService: FederalElectionService) {
    super();
  }

  @ApiOperation({ description: 'Upload a new file to import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file to upload', type: FileUploadDto })
  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    const data: { features: ApiFederalElectionFeature[] } = JSON.parse(
      file.buffer.toString(),
    );

    // TODO Validate Data
    await this.federalElectionService.createCollection(data.features);

    return 'done';
  }

  @ApiOperation({ description: 'Query for federal election data' })
  @Post('query')
  async query(
    @InjectUser() user: UserDocument,
    @Body() query: ApiGeometryDto,
  ): Promise<FederalElectionDocument[]> {
    return this.federalElectionService.findIntersecting(user, query);
  }
}
