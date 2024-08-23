import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import { UserService } from '../../user/user.service';
import { apiRouteToFeatTypeMap } from '../../shared/constants/api';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly userService: UserService) {
    super(
      {
        header: 'X-Api-Key',
      },
      true,
      async (apiKey: string, verified, req): Promise<void> => {
        const user = await this.userService.findByApiKey(apiKey);
        const routePath = req.route.path;

        if (
          !user?.config.apiKeyParams.allowedFeatures.includes(
            apiRouteToFeatTypeMap[routePath],
          )
        ) {
          return verified(new UnauthorizedException());
        }

        req.principal = user;
        req.user = { email: user.email };

        verified(null, user);
      },
    );
  }
}
