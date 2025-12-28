import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      status: 'ok',
      message: 'CertiAI Backend API',
      timestamp: new Date().toISOString(),
    };
  }
}
