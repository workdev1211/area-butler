import { Controller, Get, Post, UseGuards } from '@nestjs/common';
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

  @ApiOperation({ description: 'Get a list of pending migrations' })
  @Get()
  getPendingMigrations(): Promise<string> {
    return this.migrationService.getPendingMigrations();
  }

  @ApiOperation({ description: 'Run pending migrations' })
  @Post()
  runPendingMigrations(): void {
    void this.migrationService.runPendingMigrations();
  }

  @ApiOperation({ description: 'Run next pending migration' })
  @Post('run-next')
  runNextMigration(): void {
    void this.migrationService.runNextMigration();
  }

  @ApiOperation({ description: 'Revert last migration' })
  @Post('revert-last')
  revertLastMigration(): void {
    void this.migrationService.revertLastMigration();
  }
}
