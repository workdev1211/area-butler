import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import { IntegrationUserService } from '../user/integration-user.service';
import { propstackWebhookIntRoutePaths } from '../../../shared/constants/propstack';
import { IntegrationTypesEnum } from '@area-butler-types/integration';

@Injectable()
export class PropstackWebhookIntStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'propstack-webhook-int',
) {
  constructor(private readonly integrationUserService: IntegrationUserService) {
    super(
      {
        header: 'X-Api-Key',
      },
      true,
      async (apiKey: string, verified, req): Promise<void> => {
        const integrationUser = await this.integrationUserService.findOne(
          IntegrationTypesEnum.PROPSTACK,
          {
            integrationUserId: { $regex: /^\d*?$/ },
            'parameters.apiKey': apiKey,
          },
        );

        const routePath = req.route.path;

        if (
          !integrationUser ||
          !propstackWebhookIntRoutePaths.includes(routePath)
        ) {
          return verified(new UnauthorizedException());
        }

        req.principal = integrationUser;
        // There is no email for the moment
        // req.user = { email: (integrationUser.parameters as IApiIntUserPropstackParams).email };
        verified(null, integrationUser);
      },
    );
  }
}
