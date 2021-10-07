import {
  ApiUpsertPotentialCustomer,
  ApiUpsertQuestionnaire,
  ApiUpsertQuestionnaireRequest,
} from '@area-butler-types/potential-customer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/user/schema/user.schema';
import {
  PotentialCustomer,
  PotentialCustomerDocument,
} from './schema/potential-customer.schema';
import {
  QuestionnaireRequest,
  QuestionnaireRequestDocument,
} from './schema/questionnaire-request.schema';
const crypto = require('crypto');
import { UserService } from 'src/user/user.service';
import {
  MailProps,
  MailSenderService,
} from 'src/client/mail/mail-sender.service';
import { configService } from 'src/config/config.service';

@Injectable()
export class PotentialCustomerService {
  constructor(
    @InjectModel(PotentialCustomer.name)
    private potentialCustomerModel: Model<PotentialCustomerDocument>,
    @InjectModel(QuestionnaireRequest.name)
    private questionnaireRequestModel: Model<QuestionnaireRequestDocument>,
    private userService: UserService,
    private mailSender: MailSenderService,
  ) {}

  async fetchPotentialCustomers({
    id,
  }: UserDocument): Promise<PotentialCustomerDocument[]> {
    return await this.potentialCustomerModel.find({ userId: id });
  }

  async insertPotentialCustomer(
    user: UserDocument,
    { ...upsertData }: ApiUpsertPotentialCustomer,
  ): Promise<PotentialCustomerDocument> {
    const documentData: any = {
      ...upsertData,
    };

    const document = {
      userId: user.id,
      ...documentData,
    };
    return await new this.potentialCustomerModel(document).save();
  }

  async updatePotentialCustomer(
    user: UserDocument,
    id: string,
    { ...upsertData }: Partial<ApiUpsertPotentialCustomer>,
  ): Promise<PotentialCustomerDocument> {
    const oid = new Types.ObjectId(id);
    const potentialCustomer = await this.potentialCustomerModel.findById({
      _id: oid,
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
    return await this.potentialCustomerModel.findById({
      _id: oid,
    });
  }

  async deletePotentialCustomer(user: UserDocument, id: string) {
    const oid = new Types.ObjectId(id);
    const potentialCustomer = await this.potentialCustomerModel.findById({
      _id: oid,
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
    { ...upsertData }: ApiUpsertQuestionnaireRequest,
  ): Promise<QuestionnaireRequestDocument> {
    const documentData: any = {
      ...upsertData,
    };

    const document = {
      userId: user.id,
      token: crypto.randomBytes(60).toString('hex'),
      ...documentData,
    };
    const questionnaire = await new this.questionnaireRequestModel(
      document,
    ).save();

    const mailProps: MailProps = {
      to: [{ name: questionnaire.name, email: questionnaire.email }],
      templateId: 1,
      params: {
        href: `${configService.getBaseAppUrl()}/questionnaire?token=${
          questionnaire.token
        }`,
      },
    };

    if (questionnaire.userInCopy) {
      mailProps.cc = [{ name: user.fullname, email: user.email }];
    }

    await this.mailSender.sendMail(mailProps);

    return questionnaire;
  }

  async upsertCustomerFromQuestionnaire({
    token,
    customer,
  }: ApiUpsertQuestionnaire) {
    const questionnaireRequest = await this.questionnaireRequestModel.findOne({
      token,
    });

    if (!questionnaireRequest) {
      throw new Error('Unknown token');
    }

    const { name, email, userId } = questionnaireRequest;

    const user = await this.userService.findById(userId);
    const customers = await this.fetchPotentialCustomers(user);
    const existingCustomer = customers.find(
      c => c.email.toLowerCase() === email.toLowerCase(),
    );

    const upsertData = {
      ...customer,
      name,
      email,
    };

    if (!existingCustomer) {
      await this.insertPotentialCustomer(user, upsertData);

      const mailProps: MailProps = {
        to: [{ name: user.fullname, email: user.email }],
        templateId: 2,
        params: {
          href: `${configService.getBaseAppUrl()}/potential-customers`,
        },
      };
  
      await this.mailSender.sendMail(mailProps);

    } else {
      await this.updatePotentialCustomer(
        user,
        existingCustomer.id!,
        upsertData,
      );
    }
  }
}
