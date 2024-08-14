import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { MigrationService } from './migration.service';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { RolesGuard } from '../auth/role/roles.guard';
import { Role, Roles } from '../auth/role/roles.decorator';

@ApiTags('migration')
@Controller('api/migration')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class MigrationController extends AuthenticatedController {
  constructor(private readonly migrationService: MigrationService) {
    super();
  }

  @ApiOperation({ description: 'Create companies' })
  @Post('create-companies')
  setCompanyConfigs(): void {
    void this.migrationService.createCompanies();
  }
}
