import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // TODO: Implement authentication logic
  // - User registration
  // - User login
  // - JWT token generation
  // - Password hashing/verification
  // - Email verification
}
