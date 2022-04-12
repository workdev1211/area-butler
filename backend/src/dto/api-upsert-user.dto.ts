import { ApiUpsertUser } from '@area-butler-types/types';
import { IsNotEmpty } from 'class-validator';

class ApiUpsertUserDto implements ApiUpsertUser {

  @IsNotEmpty()
  fullname: string;
}

export default ApiUpsertUserDto;
