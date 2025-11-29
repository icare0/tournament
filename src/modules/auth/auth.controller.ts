import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO: Implement authentication endpoints
  // POST /auth/register
  // POST /auth/login
  // POST /auth/refresh
  // POST /auth/verify-email
  // POST /auth/forgot-password
  // POST /auth/reset-password
}
