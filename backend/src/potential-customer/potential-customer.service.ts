import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
import ApiUpsertPotentialCustomerDto from '../dto/api-upsert-potential-customer.dto';
import ApiUpsertQuestionnaireRequestDto from '../dto/api-upsert-questionnaire-request.dto';
import ApiUpsertQuestionnaireDto from '../dto/api-upsert-questionnaire.dto';
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
} from '../shared/email.constants';
import { defaultPotentialCustomers } from '../shared/potential-customers.constants';

@Injectable()
export class PotentialCustomerService {
  constructor(
    @InjectModel(PotentialCustomer.name)
    private readonly potentialCustomerModel: Model<PotentialCustomerDocument>,
    @InjectModel(QuestionnaireRequest.name)
    private readonly questionnaireRequestModel: Model<QuestionnaireRequestDocument>,
    private readonly userService: UserService,
    private readonly mailSender: MailSenderService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async fetchPotentialCustomers({
    id: userId,
    parentId,
  }: UserDocument): Promise<PotentialCustomerDocument[]> {
    return this.potentialCustomerModel.find({
      userId: { $in: [userId, parentId] },
    });
  }

  async insertPotentialCustomer(
    user: UserDocument,
    { ...upsertData }: ApiUpsertPotentialCustomerDto,
    subscriptionCheck = true,
  ): Promise<PotentialCustomerDocument> {
    subscriptionCheck &&
      this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) => !subscriptionPlan,
        'Weitere Interessentenerstellung ist im aktuellen Plan nicht mehr möglich',
      );

    return new this.potentialCustomerModel({
      userId: user.id,
      ...upsertData,
    }).save();
  }

  async insertDefaultPotentialCustomers(userId: string): Promise<void> {
    await this.potentialCustomerModel.insertMany(
      defaultPotentialCustomers.map((customer) => ({
        ...customer,
        userId,
      })),
    );
  }

  async updatePotentialCustomer(
    user: UserDocument,
    potentialCustomerId: string,
    { ...upsertData }: Partial<ApiUpsertPotentialCustomerDto>,
  ): Promise<PotentialCustomerDocument> {
    const potentialCustomer = await this.potentialCustomerModel.findById(
      potentialCustomerId,
    );

    if (!potentialCustomer) {
      throw 'Entity not found';
    }

    if (potentialCustomer.userId !== user.id) {
      throw 'Invalid change';
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
    user: UserDocument,
    potentialCustomerId: string,
  ): Promise<void> {
    const potentialCustomer = await this.potentialCustomerModel.findById(
      potentialCustomerId,
    );

    if (!potentialCustomer) {
      throw 'Entity not found';
    }

    if (potentialCustomer.userId !== user.id) {
      throw 'Invalid delete';
    }

    await potentialCustomer.deleteOne();
  }

  async insertQuestionnaireRequest(
    user: UserDocument,
    { ...upsertData }: ApiUpsertQuestionnaireRequestDto,
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
  }: ApiUpsertQuestionnaireDto): Promise<void> {
    const questionnaireRequest = await this.questionnaireRequestModel.findOne({
      token,
    });

    if (!questionnaireRequest) {
      throw new HttpException('Unknown token', 400);
    }

    const { name, email, userId } = questionnaireRequest;
    const user = await this.userService.findById(userId);
    user.subscription = await this.subscriptionService.findActiveByUserId(
      user.parentId || user.id,
    );
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
      const newCustomer = await this.insertPotentialCustomer(user, upsertData);

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

  async findById(id: string): Promise<PotentialCustomerDocument> {
    return this.potentialCustomerModel.findById(id);
  }
}
