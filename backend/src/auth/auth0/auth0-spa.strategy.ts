import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { configService } from '../../config/config.service';

@Injectable()
export class Auth0SpaStrategy extends PassportStrategy(Strategy, 'auth0-spa') {
  
  private readonly logger = new Logger(Auth0SpaStrategy.name);

  constructor() {
    const { domain, audience } = configService.getAuth0SpaConfig();

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 1
      audience: audience,
      issuer: `https://${domain}/`,
    });

    this.logger.log(`***** auth0 domain : ${domain}`);
  }

  validate(payload: any, done: VerifiedCallback) {
    if (!payload) {
      done(new UnauthorizedException(), false); // 2
    }

    return done(null, payload);
  }
}
