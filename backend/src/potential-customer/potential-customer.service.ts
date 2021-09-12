import { ApiUpsertPotentialCustomer } from '@area-butler-types/potential-customer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/user/schema/user.schema';
import {
  PotentialCustomer,
  PotentialCustomerDocument,
} from './schema/potential-customer.schema';

@Injectable()
export class PotentialCustomerService {
  constructor(
    @InjectModel(PotentialCustomer.name)
    private potentialCustomerModel: Model<PotentialCustomerDocument>,
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
}
