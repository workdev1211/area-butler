import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ApiUpsertUser } from '@area-butler-types/types';

@Exclude()
class ApiUpsertUserDto implements ApiUpsertUser {
  @Expose()
  @IsNotEmpty()
  @IsString()
  fullname: string;
}

export default ApiUpsertUserDto;
