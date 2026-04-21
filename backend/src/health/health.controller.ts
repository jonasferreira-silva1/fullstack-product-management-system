import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Controller de health check — usado pelo Docker para verificar
 * se a aplicação está pronta para receber requisições.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verifica se a API está online' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
