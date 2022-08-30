import { Injectable } from '@nestjs/common';
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

@Injectable()
export class PotentialCustomerService {
  constructor(
    @InjectModel(PotentialCustomer.name)
    private potentialCustomerModel: Model<PotentialCustomerDocument>,
    @InjectModel(QuestionnaireRequest.name)
    private questionnaireRequestModel: Model<QuestionnaireRequestDocument>,
    private userService: UserService,
    private mailSender: MailSenderService,
    private subscriptionService: SubscriptionService,
  ) {}

  async fetchPotentialCustomers({
    id,
    parentId,
  }: UserDocument): Promise<PotentialCustomerDocument[]> {
    return this.potentialCustomerModel.find({
      userId: { $in: [id, parentId] },
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
        (subscription) => !subscription,
        'Weitere Interessentenerstellung ist im aktuellen Plan nicht mehr möglich',
      );

    const documentData: any = {
      ...upsertData,
    };

    const document = {
      userId: user.id,
      ...documentData,
    };

    return new this.potentialCustomerModel(document).save();
  }

  async updatePotentialCustomer(
    user: UserDocument,
    id: string,
    { ...upsertData }: Partial<ApiUpsertPotentialCustomerDto>,
  ): Promise<PotentialCustomerDocument> {
    const potentialCustomer = await this.potentialCustomerModel.findById({
      _id: id,
    });

    if (!potentialCustomer) {
      throw 'Entity not found';
    }

    if (potentialCustomer.userId !== user.id) {
      throw 'Unallowed change';
    }

    const documentData: any = {
      ...upsertData,
    };

    await potentialCustomer.updateOne(documentData);

    return this.potentialCustomerModel.findById({
      _id: id,
    });
  }

  async deletePotentialCustomer(user: UserDocument, id: string) {
    const potentialCustomer = await this.potentialCustomerModel.findById({
      _id: id,
    });

    if (!potentialCustomer) {
      throw 'Entity not found';
    }

    if (potentialCustomer.userId !== user.id) {
      throw 'Unallowed delete';
    }

    await potentialCustomer.deleteOne();
  }

  async insertQuestionnaireRequest(
    user: UserDocument,
    { ...upsertData }: ApiUpsertQuestionnaireRequestDto,
  ): Promise<QuestionnaireRequestDocument> {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscription) =>
        !subscription?.appFeatures.sendCustomerQuestionnaireRequest,
      'Der Versand eines Fragebogens ist im aktuellen Plan nicht möglich',
    );

    const documentData: any = {
      ...upsertData,
    };

    const document = {
      userId: user.id,
      token: randomBytes(60).toString('hex'),
      ...documentData,
    };

    const questionnaire = await new this.questionnaireRequestModel(
      document,
    ).save();

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

    await this.mailSender.batchSendMail(mailProps);

    return questionnaire;
  }

  async upsertCustomerFromQuestionnaire({
    token,
    customer,
  }: ApiUpsertQuestionnaireDto) {
    const questionnaireRequest = await this.questionnaireRequestModel.findOne({
      token,
    });

    if (!questionnaireRequest) {
      throw new Error('Unknown token');
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

      await this.mailSender.batchSendMail(mailProps);
    } else {
      await this.updatePotentialCustomer(user, existingCustomer.id, upsertData);
    }
  }

  async findById(id: string): Promise<PotentialCustomerDocument> {
    return this.potentialCustomerModel.findById(id);
  }
}
