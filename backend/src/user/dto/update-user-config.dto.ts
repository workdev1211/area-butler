import { Exclude } from 'class-transformer';

import { IUserConfig } from '@area-butler-types/user';
import { PartialType } from '@nestjs/swagger';
import UserConfigDto from './user-config.dto';

@Exclude()
class UpdateUserConfigDto
  extends PartialType(UserConfigDto)
  implements Partial<IUserConfig> {}

export default UpdateUserConfigDto;
