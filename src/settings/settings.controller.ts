import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  update(@Body() updateSettingsDto: Record<string, any>) {
    const promises = Object.entries(updateSettingsDto).map(([key, value]) =>
      this.settingsService.update(key, value),
    );
    return Promise.all(promises);
  }
}
