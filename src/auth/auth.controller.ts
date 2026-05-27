import { Body, Controller, HttpCode, HttpStatus, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.authService.getAuditLogs();
  }

  @Get('observation-list')
  getObservationList() {
    return this.authService.getObservationList();
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.generatePasswordResetToken(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { email: string, otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }
}