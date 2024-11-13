import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PotentCustomerEventEnum } from '../../event/event.types';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { OnOfficeQueryBuilderService } from '../service/query-builder/on-office-query-builder.service';
import { OnOfficeService } from '../service/on-office.service';
import { OnEvents } from '../../shared/decorators/on-events.decorator';

@Injectable()
export class OnOfficeListener {
  constructor(
    private onOfficeService: OnOfficeService,
    private onOfficeQueryBuilderService: OnOfficeQueryBuilderService,
  ) {}

  @OnEvents(
    [PotentCustomerEventEnum.created, PotentCustomerEventEnum.updated],
    { async: true },
  )
  private async handlePotentCustomerCreatedEvent(
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
}
