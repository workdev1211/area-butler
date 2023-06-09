import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { configService } from './config.service';
import { ApiConfigDto } from '../dto/api-config.dto';

@ApiTags('config')
@Controller('api/config')
export class ConfigController {
  @ApiOperation({ description: 'Get the client configuration' })
  @Get()
  fetchConfig(): ApiConfigDto {
    return configService.getFrontendConfig();
  }
}
