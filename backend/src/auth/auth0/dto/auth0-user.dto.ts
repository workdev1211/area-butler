import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IAuth0User } from '../auth0-api.strategy';

@Exclude()
class Auth0UserDto implements IAuth0User {
  @Expose()
  @IsNotEmpty()
  @IsString()
  iss: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  sub: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  aud: string;

  @Expose()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  iat: number;

  @Expose()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  exp: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  gty: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  azp: string;
}

export default Auth0UserDto;
