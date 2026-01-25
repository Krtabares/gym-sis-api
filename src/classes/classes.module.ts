import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { ClassType, ClassTypeSchema, Schedule, ScheduleSchema } from './entities/class-item.entity';
import { Booking, BookingSchema } from './entities/booking.entity';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassType.name, schema: ClassTypeSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    MembershipsModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
