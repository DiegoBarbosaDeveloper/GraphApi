import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok', service: 'pedidos-service', timestamp: new Date().toISOString() };
  }
}
