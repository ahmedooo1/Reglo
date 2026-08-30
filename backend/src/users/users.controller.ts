import { Body, Controller, Get, NotFoundException, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    const allowed = [
      'name',
      'companyName',
      'siret',
      'vatNumber',
      'address',
      'iban',
      'defaultPaymentTermsDays',
    ];
    const data: any = {};
    for (const key of allowed) if (key in body) data[key] = body[key];
    const updated = await this.usersService.updateProfile(req.user.id, data);
    if (!updated) throw new NotFoundException('Utilisateur introuvable');
    const { passwordHash, ...safe } = updated;
    return safe;
  }

  @Post('me/password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
    return { success: true };
  }
}
