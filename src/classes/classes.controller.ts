import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ScheduleGeneratorService } from './schedule-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly generatorService: ScheduleGeneratorService
  ) {}

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

  @Post('types/:id/delete')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async deleteClassType(@Param('id') id: string) {
    return this.classesService.deleteClassType(id);
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

  // Recurring Schedules
  @Post('recurring')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async createRecurring(@Body() data: any) {
    return this.classesService.createRecurring(data);
  }

  @Get('recurring')
  async findAllRecurring() {
    return this.classesService.findAllRecurring();
  }

  @Post('recurring/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async deleteRecurring(@Param('id') id: string) {
    return this.classesService.deleteRecurring(id);
  }

  @Post('generate')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async manualGenerate() {
    await this.generatorService.generateSchedules(14);
    return { message: 'Schedules generated successfully for the next 14 days' };
  }

  @Get('my-bookings')
  async findMyBookings(@Request() req: any) {
    const userId = req.user.userId;
    return this.classesService.findUserBookings(userId);
  }

  // Bookings
  @Post('book/:scheduleId')
  async bookClass(@Request() req: any, @Param('scheduleId') scheduleId: string) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.classesService.bookClass(userId, scheduleId, userRole);
  }


  @Post('cancel/:scheduleId')
  async cancelBooking(@Request() req: any, @Param('scheduleId') scheduleId: string) {
    const userId = req.user.userId;
    return this.classesService.cancelBooking(userId, scheduleId);
  }

  @Post('schedule/:id/delete')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async deleteSchedule(@Param('id') id: string) {
    return this.classesService.deleteSchedule(id);
  }
}
