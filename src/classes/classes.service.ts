import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassType, Schedule } from './entities/class-item.entity';
import { RecurringSchedule } from './entities/recurring-schedule.entity';
import { Booking, BookingStatus } from './entities/booking.entity';
import { MembershipsService } from '../memberships/memberships.service';
import { SettingsService } from '../settings/settings.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(ClassType.name) private classTypeModel: Model<ClassType>,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
    @InjectModel(RecurringSchedule.name) private recurringModel: Model<RecurringSchedule>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private membershipsService: MembershipsService,
    private settingsService: SettingsService,
  ) {}

  // Class Type Management
  async createClassType(data: { name: string; description?: string }): Promise<ClassType> {
    const newType = new this.classTypeModel(data);
    return newType.save();
  }

  async findAllClassTypes(): Promise<ClassType[]> {
    return this.classTypeModel.find().exec();
  }

  async deleteClassType(id: string): Promise<any> {
    // Check if being used in recurring schedules
    const isUsed = await this.recurringModel.exists({ classTypeId: id });
    if (isUsed) {
      throw new BadRequestException('Cannot delete category being used in the weekly schedule');
    }
    return this.classTypeModel.findByIdAndDelete(id).exec();
  }

  // Recurring Schedule Management
  async createRecurring(data: any): Promise<RecurringSchedule> {
    const newRecurring = new this.recurringModel(data);
    return newRecurring.save();
  }

  async findAllRecurring(): Promise<RecurringSchedule[]> {
    return this.recurringModel.find().populate('classTypeId').populate('coachId', 'name').exec();
  }

  async deleteRecurring(id: string): Promise<any> {
    const recurring = await this.recurringModel.findById(id).exec();
    if (!recurring) return;

    // Optional: Clean up future schedules generated from this pattern
    const today = new Date();
    await this.scheduleModel.deleteMany({
      classTypeId: recurring.classTypeId,
      coachId: recurring.coachId, // Matches the specific coach too
      dateTime: { $gte: today },
      attendees: { $size: 0 } // Only delete if nobody has booked yet
    }).exec();

    return this.recurringModel.findByIdAndDelete(id).exec();
  }

  // Schedule Management
  async createSchedule(data: {
    classTypeId: string;
    coachId: string;
    dateTime: Date;
    capacity: number;
  }): Promise<Schedule> {
    const newSchedule = new this.scheduleModel(data);
    return newSchedule.save();
  }

  async findAllSchedules(): Promise<Schedule[]> {
    return this.scheduleModel.find().populate('classTypeId').populate('coachId', 'name').exec();
  }

  async deleteSchedule(id: string): Promise<any> {
    const schedule = await this.scheduleModel.findById(id).exec();
    if (!schedule) throw new NotFoundException('Schedule not found');
    
    // Also delete associated bookings
    await this.bookingModel.deleteMany({ scheduleId: id }).exec();
    
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }

  // Booking Logic
  async bookClass(userId: string, scheduleId: string, userRole?: string): Promise<Booking> {
    // 1. Check active subscription
    const subscription = await this.membershipsService.findUserSubscription(userId);
    if (!subscription) {
      throw new BadRequestException('User does not have an active subscription');
    }

    // 2. Check schedule existence and capacity
    const schedule = await this.scheduleModel.findById(scheduleId).exec();
    if (!schedule) throw new NotFoundException('Schedule not found');

    // --- Time Restriction Check ---
    const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.OWNER;
    if (!isAdmin) {
      const windowDays = await this.settingsService.findOne('bookingWindowDays');
      if (windowDays !== null) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const limitDate = new Date(today);
        limitDate.setDate(limitDate.getDate() + windowDays);
        limitDate.setHours(23, 59, 59, 999);

        const classDate = new Date(schedule.dateTime);
        if (classDate > limitDate) {
          throw new BadRequestException(`No puedes reservar clases con más de ${windowDays} días de antelación.`);
        }
      }
    }
    // ------------------------------

    if (schedule.attendees.length >= schedule.capacity) {

      throw new BadRequestException('Class is full');
    }

    // 3. Check if already booked
    const existingBooking = await this.bookingModel.findOne({
      userId,
      scheduleId,
      status: BookingStatus.CONFIRMED,
    }).exec();
    
    if (existingBooking) {
      throw new BadRequestException('User is already booked for this class');
    }

    // 4. Update schedule attendees
    await this.scheduleModel.findByIdAndUpdate(scheduleId, {
      $push: { attendees: userId },
    }).exec();

    // 5. Create booking record
    const newBooking = new this.bookingModel({
      userId,
      scheduleId,
      status: BookingStatus.CONFIRMED,
    });

    return newBooking.save();
  }

  async cancelBooking(userId: string, scheduleId: string): Promise<Booking> {
    const booking = await this.bookingModel.findOneAndUpdate(
      { userId, scheduleId, status: BookingStatus.CONFIRMED },
      { status: BookingStatus.CANCELLED },
      { new: true },
    ).exec();

    if (!booking) throw new NotFoundException('Booking not found');

    // Remove from schedule attendees
    await this.scheduleModel.findByIdAndUpdate(scheduleId, {
      $pull: { attendees: userId },
    }).exec();

    return booking;
  }

  async findUserBookings(userId: string): Promise<any[]> {
    return this.bookingModel.find({ userId, status: BookingStatus.CONFIRMED })
      .populate({
        path: 'scheduleId',
        populate: [
          { path: 'classTypeId' },
          { path: 'coachId', select: 'name' }
        ]
      })
      .exec();
  }
}
