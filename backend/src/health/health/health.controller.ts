import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('api/health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private mongooseIndicator: MongooseHealthIndicator,
  ) {}

  @ApiOperation({
    description: 'Perform a health check including the database',
  })
  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.mongooseIndicator.pingCheck('database'),
    ]);
  }
}
