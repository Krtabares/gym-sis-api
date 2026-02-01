import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassesService } from './classes.service';
import { ScheduleGeneratorService } from './schedule-generator.service';
import { ClassesController } from './classes.controller';
import { ClassType, ClassTypeSchema, Schedule, ScheduleSchema } from './entities/class-item.entity';
import { RecurringSchedule, RecurringScheduleSchema } from './entities/recurring-schedule.entity';
import { Booking, BookingSchema } from './entities/booking.entity';
import { MembershipsModule } from '../memberships/memberships.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassType.name, schema: ClassTypeSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: RecurringSchedule.name, schema: RecurringScheduleSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    MembershipsModule,
    SettingsModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService, ScheduleGeneratorService],
})
export class ClassesModule {}

