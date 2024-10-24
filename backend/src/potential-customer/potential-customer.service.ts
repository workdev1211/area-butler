import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionFields, Types } from 'mongoose';
import { randomBytes } from 'crypto';

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
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  ApiUpsertPotentialCustomer,
  ApiUpsertQuestionnaire,
  ApiUpsertQuestionnaireRequest,
} from '@area-butler-types/potential-customer';
import { UserService } from '../user/user.service';
import { SubscriptionService } from '../user/subscription.service';
import { TUnitedUser } from '../shared/types/user';

type TFilterQuery = FilterQuery<PotentialCustomerDocument>;
type TProjectQuery = ProjectionFields<PotentialCustomerDocument>;

@Injectable()
export class PotentialCustomerService {
  constructor(
    @InjectModel(PotentialCustomer.name)
    private readonly potentialCustomerModel: Model<PotentialCustomerDocument>,
    @InjectModel(QuestionnaireRequest.name)
    private readonly questionnaireRequestModel: Model<QuestionnaireRequestDocument>,
    private readonly mailSender: MailSenderService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
  ) {}

  async findOne(
    user: TUnitedUser,
    filterQuery: FilterQuery<PotentialCustomerDocument>,
    projectQuery?: ProjectionFields<PotentialCustomerDocument>,
  ): Promise<PotentialCustomerDocument> {
    return this.potentialCustomerModel.findOne(
      this.injectUserIds(user, filterQuery),
      projectQuery,
    );
  }

  async findMany(
    user: TUnitedUser,
    projectQuery?: TProjectQuery,
  ): Promise<PotentialCustomerDocument[]> {
    return this.potentialCustomerModel.find(
      this.injectUserIds(user),
      projectQuery,
    );
  }

  async fetchNames(
    user: UserDocument | TIntegrationUserDocument,
  ): Promise<string[]> {
    const potentialCustomers = await this.findMany(user, {
      name: 1,
    });

    return potentialCustomers.map(({ name }) => name);
  }

  async createPotentialCustomer(
    user: UserDocument | TIntegrationUserDocument,
    { ...upsertData }: ApiUpsertPotentialCustomer,
    subscriptionCheck = true,
  ): Promise<PotentialCustomerDocument> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      subscriptionCheck &&
        this.subscriptionService.checkSubscriptionViolation(
          user.subscription.type,
          (subscriptionPlan) => !subscriptionPlan,
          'Weitere Interessentenerstellung ist im aktuellen Plan nicht mehr möglich',
        );
    }

    const potentialCustomerDoc = { ...upsertData };

    Object.assign(
      potentialCustomerDoc,
      isIntegrationUser
        ? {
            integrationParams: {
              integrationUserId: user.integrationUserId,
              integrationType: user.integrationType,
            },
          }
        : { userId: user.id },
    );

    return new this.potentialCustomerModel(potentialCustomerDoc).save();
  }

  async createDefaultPotentialCustomers(
    user: UserDocument | TIntegrationUserDocument,
  ): Promise<void> {
    const isIntegrationUser = 'integrationUserId' in user;

    const userData = isIntegrationUser
      ? {
          integrationParams: {
            integrationUserId: user.integrationUserId,
            integrationType: user.integrationType,
          },
        }
      : { userId: user.id };

    await this.potentialCustomerModel.insertMany(
      defaultPotentialCustomers.map((potentialCustomer) => ({
        ...potentialCustomer,
        ...userData,
      })),
    );
  }

  async updatePotentialCustomer(
    user: UserDocument | TIntegrationUserDocument,
    potentialCustomerId: string,
    { ...upsertData }: Partial<ApiUpsertPotentialCustomer>,
  ): Promise<PotentialCustomerDocument> {
    const isIntegrationUser = 'integrationUserId' in user;

    const potentialCustomer = await this.potentialCustomerModel.findById(
      potentialCustomerId,
    );

    if (!potentialCustomer) {
      throw new HttpException('Potential customer not found!', 400);
    }

    const isInvalidChange = isIntegrationUser
      ? potentialCustomer.integrationParams.integrationUserId !==
        user.integrationUserId
      : potentialCustomer.userId !== user.id;

    if (isInvalidChange) {
      throw new HttpException('Invalid change!', 400);
    }

    return this.potentialCustomerModel.findByIdAndUpdate(
      potentialCustomerId,
      {
        ...upsertData,
      },
      { new: true },
    );
  }

  async deletePotentialCustomer(
    user: UserDocument | TIntegrationUserDocument,
    potentialCustomerId: string,
  ): Promise<void> {
    const isIntegrationUser = 'integrationUserId' in user;

    const potentialCustomer = await this.potentialCustomerModel.findById(
      potentialCustomerId,
    );

    if (!potentialCustomer) {
      throw new HttpException('Potential customer not found!', 400);
    }

    const isInvalidChange = isIntegrationUser
      ? potentialCustomer.integrationParams.integrationUserId !==
        user.integrationUserId
      : potentialCustomer.userId !== user.id;

    if (isInvalidChange) {
      throw new HttpException('Invalid delete!', 400);
    }

    await potentialCustomer.deleteOne();
  }

  async insertQuestionnaireRequest(
    user: UserDocument,
    { ...upsertData }: ApiUpsertQuestionnaireRequest,
  ): Promise<QuestionnaireRequestDocument> {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
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

  async upsertCustomerFromQuestionnaire({
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

    const customers = await this.findMany(user);

    const existingCustomer = customers.find(
      (c) => c.email?.toLowerCase() === email.toLowerCase(),
    );

    const upsertData = {
      ...customer,
      name,
      email,
    };

    if (!existingCustomer) {
      const newCustomer = await this.createPotentialCustomer(user, upsertData);

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
    } else {
      await this.updatePotentialCustomer(user, existingCustomer.id, upsertData);
    }
  }

  private injectUserIds(
    user: TUnitedUser,
    filterQuery: TFilterQuery = {},
  ): TFilterQuery {
    const resFilterQuery: TFilterQuery = {
      ...filterQuery,
    };

    const isIntegrationUser = 'integrationUserId' in user;
    const userIds: (Types.ObjectId | string)[] = [];

    if (!isIntegrationUser) {
      userIds.push(user._id);

      if (user.parentUser) {
        userIds.push(user.parentUser._id);
      }

      resFilterQuery.userId = { $in: userIds };

      return resFilterQuery;
    }

    userIds.push(user.integrationUserId);

    if (user.parentUser) {
      userIds.push(user.parentUser.integrationUserId);
    }

    Object.assign(resFilterQuery, {
      'integrationParams.integrationUserId': { $in: userIds },
      'integrationParams.integrationType': user.integrationType,
    });

    return resFilterQuery;
  }
}
