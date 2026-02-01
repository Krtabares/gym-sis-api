import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Schedule } from './entities/class-item.entity';
import { RecurringSchedule } from './entities/recurring-schedule.entity';
import { addDays, setHours, setMinutes, startOfDay, format, isSameDay } from 'date-fns';

@Injectable()
export class ScheduleGeneratorService {
  private readonly logger = new Logger(ScheduleGeneratorService.name);

  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
    @InjectModel(RecurringSchedule.name) private recurringModel: Model<RecurringSchedule>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running automated schedule generator...');
    await this.generateSchedules(14); // Look ahead 14 days
  }

  async generateSchedules(daysAhead: number = 14) {
    const recurringPatterns = await this.recurringModel.find({ isActive: true }).exec();
    const today = startOfDay(new Date());

    for (let i = 0; i < daysAhead; i++) {
      const targetDate = addDays(today, i);
      const dayOfWeek = targetDate.getDay();

      const patternsForDay = recurringPatterns.filter(p => p.dayOfWeek === dayOfWeek);

      for (const pattern of patternsForDay) {
        const [hours, minutes] = pattern.startTime.split(':').map(Number);
        const scheduleDateTime = setMinutes(setHours(targetDate, hours), minutes);

        // Check if already exists for this type AND date AND time
        const startOfTarget = startOfDay(scheduleDateTime);
        const endOfTarget = addDays(startOfTarget, 1);

        const exists = await this.scheduleModel.findOne({
          classTypeId: pattern.classTypeId,
          dateTime: scheduleDateTime,
        }).exec();

        if (!exists) {
          await this.scheduleModel.create({
            classTypeId: pattern.classTypeId,
            coachId: pattern.coachId,
            dateTime: scheduleDateTime,
            capacity: pattern.capacity,
            attendees: [],
          });
          this.logger.log(`Created schedule for ${pattern.startTime} on ${format(targetDate, 'yyyy-MM-dd')}`);
        }
      }
    }
  }
}
