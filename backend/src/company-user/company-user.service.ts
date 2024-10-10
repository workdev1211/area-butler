import { ForbiddenException, Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { plainToInstance } from 'class-transformer';
import * as dayjs from 'dayjs';
import { ManipulateType } from 'dayjs';

import { UserDocument } from '../user/schema/user.schema';
import { EventType } from '../event/event.types';
import { TRIAL_PRICE_ID } from '../../../shared/constants/subscription/trial';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/service/user.service';
import { SubscriptionService } from '../user/service/subscription.service';
import { IApiCompanyConfig } from '@area-butler-types/company';
import CompanyConfigDto from '../company/dto/company-config.dto';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IntegrationUserService } from '../user/service/integration-user.service';

@Injectable()
export class CompanyUserService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly eventEmitter: EventEmitter2,
    private readonly integrationUserService: IntegrationUserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
  ) {}

  async upsertUser(email: string, fullname: string): Promise<UserDocument> {
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      return existingUser;
    }

    const company = await this.companyService.create();
    const newUser = await this.userService.create(email, fullname, company.id);
    newUser.company = company;

    // creates a new Stripe customer and default potential customer records
    void this.eventEmitter.emitAsync(EventType.USER_CREATED_EVENT, {
      user: newUser,
    });

    const {
      price: { interval },
    } = this.subscriptionService.getApiSubscriptionPlanPrice(TRIAL_PRICE_ID);

    // creates Trial subscription
    void this.eventEmitter.emitAsync(
      EventType.TRIAL_SUBSCRIPTION_UPSERT_EVENT,
      {
        user: newUser,
        endsAt: dayjs()
          .add(interval.value, interval.unit as ManipulateType)
          .toDate(),
      },
    );

    return newUser;
  }

  updateCompanyConfig(
    user: TIntegrationUserDocument,
    config: Partial<IApiCompanyConfig>,
  ): Promise<TIntegrationUserDocument>;

  updateCompanyConfig(
    user: UserDocument,
    config: Partial<IApiCompanyConfig>,
  ): Promise<UserDocument>;

  async updateCompanyConfig(
    user: TIntegrationUserDocument | UserDocument,
    config: Partial<IApiCompanyConfig>,
  ): Promise<TIntegrationUserDocument | UserDocument> {
    if (!user.isAdmin) {
      throw new ForbiddenException();
    }

    const companyConfigDto = plainToInstance(CompanyConfigDto, config, {
      excludeExtraneousValues: true,
      exposeDefaultValues: false,
      exposeUnsetFields: false,
    });

    await this.companyService.updateConfig(user.company._id, companyConfigDto);

    const isIntegrationUser = 'integrationUserId' in user;
    const filterQuery: FilterQuery<TIntegrationUserDocument | UserDocument> = {
      _id: user._id,
    };

    return isIntegrationUser
      ? await this.integrationUserService.findOneCore(filterQuery)
      : await this.userService.findOneCore(filterQuery);
  }
}
