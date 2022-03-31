import { ApiFederalElectionFeature } from '@area-butler-types/federal-election';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { FederalElectionService } from './federal-election.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import FileUploadDto from '../../dto/file-upload.dto';
import ApiGeometryDto from '../../dto/api-geometry.dto';

@ApiTags('federal-election')
@Controller('api/federal-election')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FederalElectionController extends AuthenticatedController {
  constructor(private federalElectionService: FederalElectionService) {
    super();
  }

  @ApiOperation({ description: 'Upload a new file to import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file to upload', type: FileUploadDto })
  @Post('upload')
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const data: { features: ApiFederalElectionFeature[] } = JSON.parse(
      file.buffer.toString(),
    );
    //TODO: Validate Data
    await this.federalElectionService.createCollection(data.features);
    return 'done';
  }

  @ApiOperation({ description: 'Query for federal election data' })
  @Post('query')
  async query(@Body() query: ApiGeometryDto, @InjectUser() user: UserDocument) {
    return await this.federalElectionService.findIntersecting(query, user);
  }
}
