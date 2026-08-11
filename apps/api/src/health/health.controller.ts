import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  // Inject HealthService để xử lý logic kiểm tra trạng thái hệ thống
  constructor(private readonly healthService: HealthService) {}

  // GET /health - kiểm tra API và database có đang hoạt động không
  @Get()
  check() {
    return this.healthService.check();
  }
}