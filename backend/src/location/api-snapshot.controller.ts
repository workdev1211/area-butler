import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InjectUser } from '../user/inject-user.decorator';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ApiSnapshotService } from './api-snapshot.service';
import ApiCreateSnapshotFromTemplateDto from '../dto/api-create-snapshot-from-template.dto';
import { configService } from '../config/config.service';
import { ApiKeyAuthController } from '../shared/api-key-auth.controller';

@ApiTags('snapshot', 'api')
@Controller('api/api-snapshot')
export class ApiSnapshotController extends ApiKeyAuthController {
  constructor(private readonly snapshotService: ApiSnapshotService) {
    super();
  }

  @ApiOperation({
    description: 'Create a search result snapshot from a template',
  })
  @Post('template')
  async createSnapshotFromTemplate(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body()
    { coordinates, address, snapshotId }: ApiCreateSnapshotFromTemplateDto,
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
