import {
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import { propstackWebhookIntRoutePaths } from '../../../shared/constants/propstack/propstack-constants';
import { PropstackService } from '../propstack/propstack.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { Types } from 'mongoose';
import { IApiIntUserPropstackParams } from '@area-butler-types/integration-user';
import { IntegrationUserService } from '../user/integration-user.service';
import { IntegrationTypesEnum } from '@area-butler-types/integration';

@Injectable()
export class PropstackWebhookIntStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'propstack-webhook-int',
) {
  private readonly logger = new Logger(PropstackWebhookIntStrategy.name);
  private readonly integrationType = IntegrationTypesEnum.PROPSTACK;

  constructor(private readonly integrationUserService: IntegrationUserService) {
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
            shop: { id: shopId },
            team_id: teamId,
          },
        } = reqBody;

        // TODO a duplicate code from 'PropstackService.getIntegrationUser' method
        let integrationUser: TIntegrationUserDocument;

        if (teamId) {
          integrationUser = await this.integrationUserService.findOne(
            this.integrationType,
            {
              integrationUserId: `${shopId}-${teamId}`,
              'parameters.apiKey': apiKey,
            },
          );

          if (integrationUser?.parentId) {
            integrationUser.parentUser =
              await this.integrationUserService.findOne(this.integrationType, {
                _id: new Types.ObjectId(integrationUser.parentId),
                isParent: true,
                'parameters.apiKey': apiKey,
              });
          }
        }

        if (teamId && !integrationUser) {
          const parentUser = await this.integrationUserService.findOne(
            this.integrationType,
            {
              integrationUserId: `${shopId}`,
              isParent: true,
              'parameters.apiKey': apiKey,
            },
          );

          if (!parentUser) {
            return;
          }

          integrationUser = await this.integrationUserService.findOneAndUpdate(
            this.integrationType,
            {
              integrationUserId: `${shopId}-${teamId}`,
            },
            { 'parameters.apiKey': apiKey },
          );

          if (!integrationUser) {
            integrationUser = await this.integrationUserService
              .create({
                accessToken: PropstackService.encryptAccessToken(
                  `${apiKey}-${teamId}`,
                ),
                integrationType: this.integrationType,
                integrationUserId: `${shopId}-${teamId}`,
                parameters: {
                  apiKey,
                  shopId: parseInt(shopId, 10),
                  teamId: parseInt(teamId, 10),
                } as IApiIntUserPropstackParams,
                parentId: parentUser.id,
              })
              .catch((e) => {
                this.logger.error(e);

                this.logger.debug(
                  `\nAPI key: ${apiKey}` +
                    `\nShop id: ${shopId}` +
                    `\nTeam id: ${teamId}`,
                );

                return undefined;
              });
          }

          integrationUser.parentUser = parentUser;
        }

        if (!teamId && !integrationUser) {
          integrationUser = await this.integrationUserService.findOne(
            this.integrationType,
            {
              integrationUserId: `${shopId}`,
              isParent: true,
              'parameters.apiKey': apiKey,
            },
          );
        }

        if (!integrationUser) {
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
