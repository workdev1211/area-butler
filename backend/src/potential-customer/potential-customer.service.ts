import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionFields, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  PotentialCustomer,
  PotentialCustomerDocument,
} from './schema/potential-customer.schema';
import {
  QuestionnaireRequest,
  QuestionnaireRequestDocument,
} from './schema/questionnaire-request.schema';
import {
  MailSenderService,
  IMailProps,
} from '../client/mail/mail-sender.service';
import { configService } from '../config/config.service';
import { UserDocument } from '../user/schema/user.schema';
import {
  questionnaireInvitationTemplateId,
  questionnaireSubmissionTemplateId,
} from '../shared/constants/email';
import { defaultPotentialCustomers } from '../shared/constants/potential-customers';
import {
  ApiUpsertPotentialCustomer,
  ApiUpsertQuestionnaire,
  ApiUpsertQuestionnaireRequest,
} from '@area-butler-types/potential-customer';
import { UserService } from '../user/service/user.service';
import { SubscriptionService } from '../user/service/subscription.service';
import { TUnitedUser } from '../shared/types/user';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import { PotentCustomerEventEnum } from '../event/event.types';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

type TFilterQuery = FilterQuery<PotentialCustomerDocument>;
type TProjectQuery = ProjectionFields<PotentialCustomerDocument>;

@Injectable()
export class PotentialCustomerService {
  constructor(
    @InjectModel(PotentialCustomer.name)
    private readonly potentialCustomerModel: Model<PotentialCustomerDocument>,
    @InjectModel(QuestionnaireRequest.name)
    private readonly questionnaireRequestModel: Model<QuestionnaireRequestDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailSender: MailSenderService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
  ) {}

  async create(
    user: TUnitedUser,
    { ...upsertData }: ApiUpsertPotentialCustomer,
    subscriptionCheck = true,
  ): Promise<PotentialCustomerDocument> {
    if (!user.isAdmin) {
      throw new ForbiddenException();
    }

    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      subscriptionCheck &&
        this.subscriptionService.checkSubscriptionViolation(
          user.subscription?.type,
          (subscriptionPlan) => !subscriptionPlan,
          'Weitere Interessentenerstellung ist im aktuellen Plan nicht mehr möglich',
        );
    }

    const potentialCustomerDoc = { ...upsertData, companyId: user.companyId };

    const newPotentialCustomer = await this.potentialCustomerModel.create(
      potentialCustomerDoc,
    );

    if (
      isIntegrationUser &&
      user.integrationType === IntegrationTypesEnum.ON_OFFICE
    ) {
      void this.eventEmitter.emitAsync(PotentCustomerEventEnum.created, user);
    }

    return newPotentialCustomer;
  }

  createDefault(user: TUnitedUser): void {
    void this.potentialCustomerModel.insertMany(
      defaultPotentialCustomers.map((potentialCustomer) => ({
        ...potentialCustomer,
        companyId: user.companyId,
      })),
    );
  }

  async insertQuestionnaire(
    user: UserDocument,
    { ...upsertData }: ApiUpsertQuestionnaireRequest,
  ): Promise<QuestionnaireRequestDocument> {
    this.subscriptionService.checkSubscriptionViolation(
      user.subscription?.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.sendCustomerQuestionnaireRequest &&
        !subscriptionPlan?.appFeatures.sendCustomerQuestionnaireRequest,
      'Der Versand eines Fragebogens ist im aktuellen Plan nicht möglich',
    );

    const questionnaire = await new this.questionnaireRequestModel({
      userId: user.id,
      token: randomBytes(60).toString('hex'),
      ...upsertData,
    }).save();

    const mailProps: IMailProps = {
      to: [{ name: questionnaire.name, email: questionnaire.email }],
      templateId: questionnaireInvitationTemplateId,
      params: {
        href: `${configService.getBaseAppUrl()}/questionnaire/${
          questionnaire.token
        }`,
      },
    };

    if (questionnaire.userInCopy) {
      mailProps.cc = [{ name: user.config.fullname, email: user.email }];
      mailProps.replyTo = { name: user.config.fullname, email: user.email };
    }

    await this.mailSender.sendMail(mailProps);

    return questionnaire;
  }

  async upsertFromQuestionnaire({
    token,
    customer,
  }: ApiUpsertQuestionnaire): Promise<void> {
    const questionnaireRequest = await this.questionnaireRequestModel.findOne({
      token,
    });

    if (!questionnaireRequest) {
      throw new HttpException('Unknown token', 400);
    }

    const { name, email, userId } = questionnaireRequest;

    const user = await this.userService.findById({
      userId,
    });

    const existingCustomer = await this.findOne(user, {
      filterQuery: { email: `/^${email}$/i` },
    });

    const upsertData = {
      ...customer,
      name,
      email,
    };

    if (existingCustomer) {
      void this.update(user, existingCustomer.id, upsertData);
      return;
    }

    const newCustomer = await this.create(user, upsertData);

    const mailProps: IMailProps = {
      to: [{ name: user.config.fullname, email: user.email }],
      templateId: questionnaireSubmissionTemplateId,
      params: {
        href: `${configService.getBaseAppUrl()}/potential-customers/${
          newCustomer.id
        }`,
      },
    };

    await this.mailSender.sendMail(mailProps);
  }

  async findOne(
    user: TUnitedUser,
    filterQuery?: TFilterQuery,
    projectQuery?: TProjectQuery,
  ): Promise<PotentialCustomerDocument> {
    return this.potentialCustomerModel.findOne(
      { ...filterQuery, companyId: user.companyId },
      projectQuery,
    );
  }

  async findMany(
    user: TUnitedUser,
    filterQuery?: TFilterQuery,
    projectQuery?: TProjectQuery,
  ): Promise<PotentialCustomerDocument[]> {
    return this.potentialCustomerModel.find(
      { ...filterQuery, companyId: user.companyId },
      projectQuery,
    );
  }

  async fetchNames(user: TUnitedUser): Promise<string[]> {
    const potentialCustomers = await this.findMany(user, undefined, {
      name: 1,
    });

    return [...new Set(potentialCustomers.map(({ name }) => name))];
  }

  async fetchNamesForSync(
    integrationUser: TIntegrationUserDocument,
  ): Promise<string[]> {
    const potentialCustomers = await this.potentialCustomerModel.find(
      { companyId: integrationUser.companyId },
      {
        name: 1,
      },
    );

    return [...new Set(potentialCustomers.map(({ name }) => name))];
  }

  async update(
    user: TUnitedUser,
    potentialCustomerId: string,
    { ...upsertData }: Partial<ApiUpsertPotentialCustomer>,
  ): Promise<PotentialCustomerDocument> {
    if (!user.isAdmin) {
      throw new ForbiddenException();
    }

    const filterQuery: TFilterQuery = {
      _id: new Types.ObjectId(potentialCustomerId),
      companyId: user.companyId,
    };

    const potentialCustomer = await this.potentialCustomerModel.findOne(
      filterQuery,
    );

    if (!potentialCustomer) {
      throw new HttpException('Potential customer not found!', 400);
    }

    const updatedPotentCustomer =
      await this.potentialCustomerModel.findOneAndUpdate(
        filterQuery,
        {
          ...upsertData,
        },
        { new: true },
      );

    if (
      'integrationUserId' in user &&
      user.integrationType === IntegrationTypesEnum.ON_OFFICE &&
      potentialCustomer.name !== updatedPotentCustomer.name
    ) {
      void this.eventEmitter.emitAsync(PotentCustomerEventEnum.updated, user);
    }

    return updatedPotentCustomer;
  }

  async delete(user: TUnitedUser, potentialCustomerId: string): Promise<void> {
    if (!user.isAdmin) {
      throw new ForbiddenException();
    }

    const potentialCustomer = await this.potentialCustomerModel.findOne({
      _id: new Types.ObjectId(potentialCustomerId),
      companyId: user.companyId,
    });

    if (!potentialCustomer) {
      throw new HttpException('Potential customer not found!', 400);
    }

    await potentialCustomer.deleteOne();

    const isIntegrationUser = 'integrationUserId' in user;

    if (
      isIntegrationUser &&
      user.integrationType === IntegrationTypesEnum.ON_OFFICE
    ) {
      void this.eventEmitter.emitAsync(
        PotentCustomerEventEnum.deleted,
        user,
        potentialCustomer.name,
      );
    }
  }
}
