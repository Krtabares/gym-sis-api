import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckIn } from './entities/checkin.entity';
import { MembershipsService } from '../memberships/memberships.service';

@Injectable()
export class AccessService {
  constructor(
    @InjectModel(CheckIn.name) private checkInModel: Model<CheckIn>,
    private membershipsService: MembershipsService,
  ) {}

  async validateAccess(userId: string): Promise<CheckIn> {
    const subscription = await this.membershipsService.findUserSubscription(userId);
    
    const status = subscription ? 'GRANTED' : 'DENIED';
    const reason = subscription ? null : 'No active subscription';

    const checkIn = new this.checkInModel({
      userId,
      status,
      reason,
    });

    return checkIn.save();
  }

  async findAllLogs(): Promise<CheckIn[]> {
    return this.checkInModel.find().populate('userId', 'name').sort({ createdAt: -1 }).exec();
  }

  async findUserLogs(userId: string): Promise<CheckIn[]> {
    return this.checkInModel.find({ userId }).sort({ createdAt: -1 }).limit(10).exec();
  }
}
