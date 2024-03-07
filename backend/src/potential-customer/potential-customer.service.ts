import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionFields } from 'mongoose';
import { randomBytes } from 'crypto';

import {
  PotentialCustomer,
  PotentialCustomerDocument,
} from './schema/potential-customer.schema';
import {
  QuestionnaireRequest,
  QuestionnaireRequestDocument,
} from './schema/questionnaire-request.schema';
import { SubscriptionService } from '../user/subscription.service';
import {
  MailSenderService,
  IMailProps,
} from '../client/mail/mail-sender.service';
import { configService } from '../config/config.service';
import { UserDocument } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
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
import { IntegrationUserService } from '../user/integration-user.service';

@Injectable()
export class PotentialCustomerService {
  constructor(
    @InjectModel(PotentialCustomer.name)
    private readonly potentialCustomerModel: Model<PotentialCustomerDocument>,
    @InjectModel(QuestionnaireRequest.name)
    private readonly questionnaireRequestModel: Model<QuestionnaireRequestDocument>,
    private readonly userService: UserService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly mailSender: MailSenderService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async fetchPotentialCustomers(
    user: UserDocument | TIntegrationUserDocument,
    projectQuery?: ProjectionFields<PotentialCustomerDocument>,
  ): Promise<PotentialCustomerDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;
    const userIds: string[] = [];
    let filter;

    if (isIntegrationUser) {
      userIds.push(user.integrationUserId);

      if (user.parentId) {
        const parentIntUserId =
          user.parentUser?.integrationUserId ||
          (
            await this.integrationUserService.findByDbId(user.parentId, {
              integrationUserId: 1,
            })
          ).integrationUserId;

        userIds.push(parentIntUserId);
      }

      filter = {
        'integrationParams.integrationUserId': { $in: userIds },
        'integrationParams.integrationType': user.integrationType,
      };
    }

    if (!isIntegrationUser) {
      userIds.push(user.id);

      if (user.parentId) {
        userIds.push(user.parentId);
      }

      filter = {
        userId: { $in: userIds },
      };
    }

    return this.potentialCustomerModel.find(filter, projectQuery);
  }

  async fetchNames(
    user: UserDocument | TIntegrationUserDocument,
  ): Promise<string[]> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (isIntegrationUser && user.parentId && !user.parentUser) {
      user.parentUser = await this.integrationUserService.findByDbId(
        user.parentId,
        {
          integrationUserId: 1,
        },
      );
    }

    const potentialCustomers = await this.fetchPotentialCustomers(user, {
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
      mailProps.cc = [{ name: user.fullname, email: user.email }];
      mailProps.replyTo = { name: user.fullname, email: user.email };
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
      withSubscription: true,
    });

    const customers = await this.fetchPotentialCustomers(user);

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
        to: [{ name: user.fullname, email: user.email }],
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
}
