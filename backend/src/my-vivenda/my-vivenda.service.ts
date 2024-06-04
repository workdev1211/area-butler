import { Injectable, Logger } from '@nestjs/common';

import { UserDocument } from '../user/schema/user.schema';
import { IApiMyVivendaLoginRes } from '@area-butler-types/my-vivenda';
import { UserService } from '../user/user.service';
import { MyVivendaApiService } from '../client/my-vivenda/my-vivenda-api.service';

@Injectable()
export class MyVivendaService {
  private readonly logger = new Logger(MyVivendaService.name);

  constructor(
    private readonly myVivendaApiService: MyVivendaApiService,
    private readonly userService: UserService,
  ) {}

  async login(
    user: UserDocument,
    snapshotId: string,
  ): Promise<IApiMyVivendaLoginRes> {
    return {
      snapshotId,
      user: await this.userService.transformToApiUser(user),
    };
  }

  uploadMapScreenshot(user: UserDocument, base64Image: string): Promise<void> {
    return this.myVivendaApiService.uploadMapScreenshot('api-key', base64Image);
  }
}
