import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassType, Schedule } from './entities/class-item.entity';
import { Booking, BookingStatus } from './entities/booking.entity';
import { MembershipsService } from '../memberships/memberships.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(ClassType.name) private classTypeModel: Model<ClassType>,
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private membershipsService: MembershipsService,
  ) {}

  // Class Type Management
  async createClassType(data: { name: string; description?: string }): Promise<ClassType> {
    const newType = new this.classTypeModel(data);
    return newType.save();
  }

  async findAllClassTypes(): Promise<ClassType[]> {
    return this.classTypeModel.find().exec();
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

  // Booking Logic
  async bookClass(userId: string, scheduleId: string): Promise<Booking> {
    // 1. Check active subscription
    const subscription = await this.membershipsService.findUserSubscription(userId);
    if (!subscription) {
      throw new BadRequestException('User does not have an active subscription');
    }

    // 2. Check schedule existence and capacity
    const schedule = await this.scheduleModel.findById(scheduleId).exec();
    if (!schedule) throw new NotFoundException('Schedule not found');

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
}
