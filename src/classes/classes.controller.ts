import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // Class Types
  @Post('types')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async createClassType(@Body() data: { name: string; description?: string }) {
    return this.classesService.createClassType(data);
  }

  @Get('types')
  async findAllClassTypes() {
    return this.classesService.findAllClassTypes();
  }

  // Schedules
  @Post('schedule')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COACH)
  async createSchedule(@Body() data: {
    classTypeId: string;
    coachId: string;
    dateTime: Date;
    capacity: number;
  }) {
    return this.classesService.createSchedule(data);
  }

  @Get('schedule')
  async findAllSchedules() {
    return this.classesService.findAllSchedules();
  }

  // Bookings
  @Post('book/:scheduleId')
  async bookClass(@Request() req: any, @Param('scheduleId') scheduleId: string) {
    const userId = req.user.userId;
    return this.classesService.bookClass(userId, scheduleId);
  }

  @Post('cancel/:scheduleId')
  async cancelBooking(@Request() req: any, @Param('scheduleId') scheduleId: string) {
    const userId = req.user.userId;
    return this.classesService.cancelBooking(userId, scheduleId);
  }
}
