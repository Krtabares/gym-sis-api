import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWodDto } from './dto/create-wod.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('workouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  // Exercises
  @Post('exercises')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COACH)
  async createExercise(
    @Body() data: { name: string; category?: string; description?: string },
  ) {
    return this.workoutsService.createExercise(data);
  }

  @Get('exercises')
  async findAllExercises() {
    return this.workoutsService.findAllExercises();
  }

  // WODs
  @Post('wod')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COACH)
  async createWod(@Body() data: CreateWodDto) {
    return this.workoutsService.createWod(data);
  }

  @Get('wod/today')
  async findTodayWod() {
    return this.workoutsService.findTodayWod();
  }

  @Get('wod/date')
  async findWodByDate(@Query('date') date: string) {
    return this.workoutsService.findWodByDate(date);
  }

  @Patch('wod/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COACH)
  async updateWod(@Param('id') id: string, @Body() data: CreateWodDto) {
    return this.workoutsService.updateWod(id, data);
  }
}
