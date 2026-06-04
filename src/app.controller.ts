import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // GET /api/health — endpoint public și ușor, folosit de frontend ca să verifice
  // dacă serverul răspunde (fără să mai lovească /auth/login și să primească 401).
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
