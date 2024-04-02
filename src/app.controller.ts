import { Get, Controller, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from './shared/transform.interceptor';

@Controller()
@UseInterceptors(TransformInterceptor)
export class AppController {
  @Get()
  root(): string {
    return 'Hello World!';
  }
}
