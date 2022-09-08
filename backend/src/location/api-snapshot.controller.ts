import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ApiSnapshotService } from './api-snapshot.service';
import ApiCreateSnapshotFromTemplateQueryDto from '../dto/api-create-snapshot-from-template-query.dto';
import { ApiGuard } from './api.guard';
import { configService } from '../config/config.service';

@ApiTags('api-snapshot')
@Controller('api/snapshot')
@UseGuards(AuthGuard('auth0-api'), ApiGuard)
export class ApiSnapshotController {
  constructor(private readonly snapshotService: ApiSnapshotService) {}

  @ApiOperation({
    description: 'Create a search result snapshot from a template',
  })
  @Post('template')
  async createSnapshotFromTemplate(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    { coordinates, address, snapshotId }: ApiCreateSnapshotFromTemplateQueryDto,
  ): Promise<{ snapshotId: string; directLink: string }> {
    const { id, token } = await this.snapshotService.createSnapshotFromTemplate(
      user,
      coordinates || address,
      snapshotId,
    );

    return {
      snapshotId: id,
      directLink: `${configService.getBaseAppUrl()}/embed?token=${token}`,
    };
  }
}
