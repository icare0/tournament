import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName,
        lastName,
        role: UserRole.PLAYER,
        status: UserStatus.ACTIVE,
        emailVerified: false,
      },
    });

    await this.prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        lockedBalance: 0,
        currency: 'USD',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Account has been banned');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account has been suspended');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return await this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneNumber: true,
        country: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  async loginOrRegisterOAuth(oauthUser: any) {
    // Check if user exists by email or provider ID
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: oauthUser.email },
          {
            AND: [
              { oauthProvider: oauthUser.provider },
              { oauthProviderId: oauthUser.providerId },
            ],
          },
        ],
      },
    });

    if (!user) {
      // Generate unique username from email or provider username
      let username = oauthUser.username || oauthUser.email.split('@')[0];

      // Check if username exists, if so append random number
      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        username = `${username}_${Math.floor(Math.random() * 10000)}`;
      }

      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          username,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          avatar: oauthUser.avatar,
          oauthProvider: oauthUser.provider,
          oauthProviderId: oauthUser.providerId,
          role: UserRole.PLAYER,
          status: UserStatus.ACTIVE,
          emailVerified: oauthUser.emailVerified || true, // OAuth emails are usually verified
        },
      });

      // Create wallet for new user
      await this.prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          lockedBalance: 0,
          currency: 'USD',
        },
      });
    } else if (!user.oauthProvider) {
      // Link OAuth to existing email account
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: oauthUser.provider,
          oauthProviderId: oauthUser.providerId,
          emailVerified: true,
          // Update avatar if not set
          avatar: user.avatar || oauthUser.avatar,
          // Update names if not set
          firstName: user.firstName || oauthUser.firstName,
          lastName: user.lastName || oauthUser.lastName,
        },
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'secret',
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
