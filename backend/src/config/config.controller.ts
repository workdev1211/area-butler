import { Controller, Get } from '@nestjs/common';
import { configService } from './config.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiConfigDto } from '../dto/api-config.dto';

@ApiTags('config')
@Controller('api/config')
export class ConfigController {
  @ApiOperation({ description: 'Get the client configuration' })
  @Get()
  public fetchConfig(): ApiConfigDto {
    return configService.getFrontendConfig();
  }
}
