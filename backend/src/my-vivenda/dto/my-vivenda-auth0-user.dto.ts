import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import Auth0UserDto from '../../auth/auth0/dto/auth0-user.dto';
import { IMyVivendaAuth0User } from '../interceptor/my-vivenda-handle-login.interceptor';

@Exclude()
class MyVivendaAuth0UserDto
  extends Auth0UserDto
  implements IMyVivendaAuth0User
{
  @Expose()
  @IsNotEmpty()
  @IsString()
  snapshot_id: string;

  @Expose()
  @IsOptional()
  @IsString()
  user_id?: string; // FOR DEV ENV ONLY
}

export default MyVivendaAuth0UserDto;
