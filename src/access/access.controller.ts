import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AccessService } from './access.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('access')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post('checkin')
  async validateSelfAccess(@Request() req: any) {
    const userId = req.user.userId;
    return this.accessService.validateAccess(userId);
  }

  @Post('checkin/:userId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COACH)
  async validateUserAccess(@Param('userId') userId: string) {
    return this.accessService.validateAccess(userId);
  }

  @Get('logs')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async findAllLogs() {
    return this.accessService.findAllLogs();
  }

  @Get('logs/me')
  async findMyLogs(@Request() req: any) {
    const userId = req.user.userId;
    return this.accessService.findUserLogs(userId);
  }
}
