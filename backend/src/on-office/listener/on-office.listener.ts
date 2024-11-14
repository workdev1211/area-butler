import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PotentCustomerEventEnum } from '../../event/event.types';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { OnOfficeQueryBuilderService } from '../service/query-builder/on-office-query-builder.service';
import { OnOfficeService } from '../service/on-office.service';

@Injectable()
export class OnOfficeListener {
  constructor(
    private onOfficeService: OnOfficeService,
    private onOfficeQueryBuilderService: OnOfficeQueryBuilderService,
  ) {}

  @OnEvent(PotentCustomerEventEnum.created, { async: true })
  private handlePotCustomerCreatedEvent(
    integrationUser: TIntegrationUserDocument,
  ): void {
    void this.handlePotCustomerCrtUpdEvents(integrationUser);
  }

  @OnEvent(PotentCustomerEventEnum.updated, { async: true })
  private async handlePotCustomerUpdatedEvent(
    integrationUser: TIntegrationUserDocument,
  ): Promise<void> {
    void this.handlePotCustomerCrtUpdEvents(integrationUser);
  }

  @OnEvent(PotentCustomerEventEnum.deleted, { async: true })
  private handlePotCustomerDeletedEvent(
    integrationUser: TIntegrationUserDocument,
    potentCustomerName: string,
  ): void {
    void this.onOfficeQueryBuilderService
      .setUserParams(integrationUser.parameters)
      .deleteMultiselectValues([potentCustomerName])
      .exec();
  }

  private async handlePotCustomerCrtUpdEvents(
    integrationUser: TIntegrationUserDocument,
  ): Promise<void> {
    const { getMultiselectValues } = await this.onOfficeQueryBuilderService
      .setUserParams(integrationUser.parameters)
      .getMultiselectValues()
      .exec();

    void this.onOfficeService.syncPotentCustomers(
      integrationUser,
      getMultiselectValues,
    );
  }
}
