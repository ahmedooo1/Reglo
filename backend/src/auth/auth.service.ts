import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private sign(userId: string) {
    return this.jwtService.sign({ sub: userId });
  }

  private toPublic(user: { id: string; email: string; name: string }) {
    return { id: user.id, email: user.email, name: user.name };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    await this.sendVerificationEmail(user.id, user.email);

    return { requiresVerification: true, email: user.email };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');
    if (!user.emailVerified) throw new ForbiddenException('EMAIL_NOT_VERIFIED');
    return { accessToken: this.sign(user.id), user: this.toPublic(user) };
  }

  private async sendVerificationEmail(userId: string, email: string) {
    const token = this.jwtService.sign(
      { sub: userId, purpose: 'verify_email' },
      { expiresIn: '7d' },
    );
    const base = process.env.FRONTEND_URL || 'http://localhost:3010';
    const verifyUrl = `${base}/verification/${token}`;
    await this.mailService.sendVerificationEmail({ to: email, verifyUrl });
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.purpose !== 'verify_email') throw new Error();
      await this.usersService.setEmailVerified(payload.sub);
      return { success: true };
    } catch {
      throw new UnauthorizedException('Lien invalide ou expiré');
    }
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && !user.emailVerified) {
      await this.sendVerificationEmail(user.id, user.email);
    }
    return { success: true };
  }
}
