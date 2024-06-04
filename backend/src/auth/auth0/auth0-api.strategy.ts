import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { configService } from '../../config/config.service';

export interface IAuth0User {
  iss: string; // issuer - domain
  sub: string; // 'client_id@clients'
  aud: string; // audience
  iat: number; // ms
  exp: number; // ms - expires at?
  gty: string; // grant type
  azp: string; // 'client_id'
}

@Injectable()
export class Auth0ApiStrategy extends PassportStrategy(Strategy, 'auth0-api') {
  constructor() {
    const { domain, audience } = configService.getAuth0ApiConfig();

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: IAuth0User, done: VerifiedCallback) {
    if (!payload) {
      done(new UnauthorizedException(), false);
    }

    return done(null, payload);
  }
}
