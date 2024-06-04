import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { FetchSnapshotService } from './fetch-snapshot.service';
import { MyVivendaHandleLoginInterceptor } from '../my-vivenda/interceptor/my-vivenda-handle-login.interceptor';
import { UserDocument } from '../user/schema/user.schema';

@ApiTags('location', 'integration', 'my-vivenda')
@Controller('api/location-myv')
@UseGuards(AuthGuard('auth0-api'))
export class LocationMyvController {
  constructor(private readonly fetchSnapshotService: FetchSnapshotService) {}

  @ApiOperation({ description: 'Fetch a specific map snapshot' })
  @UseInterceptors(MyVivendaHandleLoginInterceptor)
  @Get('snapshot/:id')
  fetchSnapshot(
    @InjectUser() user: UserDocument,
    @Param('id') snapshotId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.fetchSnapshotService.fetchSnapshotByIdOrFail(user, snapshotId);
  }
}
