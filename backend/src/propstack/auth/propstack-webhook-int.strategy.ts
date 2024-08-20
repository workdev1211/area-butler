import {
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import { propstackWebhookIntRoutePaths } from '../../../../shared/constants/propstack/propstack-constants';
import { PropstackService } from '../propstack.service';

@Injectable()
export class PropstackWebhookIntStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'propstack-webhook-int',
) {
  private readonly logger = new Logger(PropstackWebhookIntStrategy.name);

  constructor(private readonly propstackService: PropstackService) {
    super(
      {
        header: 'X-Api-Key',
      },
      true,
      async (apiKey: string, verified, req): Promise<void> => {
        const reqBody = req.body;
        const routePath = req.route.path;

        const isWrongReqData =
          !apiKey ||
          !reqBody ||
          !reqBody.broker ||
          !propstackWebhookIntRoutePaths.includes(routePath);

        if (isWrongReqData) {
          this.logger.verbose(
            `\nRoute path: ${routePath}` +
              `\nAPI key: ${apiKey}` +
              '\nReq body:',
            reqBody?.broker?.id,
          );

          return verified(new UnprocessableEntityException());
        }

        const {
          broker: {
            id: brokerId,
            shop: { id: shopId },
            team_id: teamId,
          },
        } = reqBody;

        const integrationUser = await this.propstackService.getIntegrationUser({
          apiKey,
          brokerId: brokerId as string,
          shopId: shopId as string,
          teamId: teamId as string,
        });

        if (!integrationUser) {
          this.logger.debug(
            `\nRoute path: ${routePath}` +
              `\nAPI key: ${apiKey}` +
              '\nReq body:',
            reqBody,
          );

          return verified(new UnauthorizedException());
        }

        req.principal = integrationUser;
        // There is no email for the moment
        // req.user = { email: (integrationUser.parameters as IApiIntUserPropstackParams).email };

        return verified(null, integrationUser);
      },
    );
  }
}
