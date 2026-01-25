import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result } from './entities/result.entity';

@Injectable()
export class ResultsService {
  constructor(@InjectModel(Result.name) private resultModel: Model<Result>) {}

  async recordResult(data: {
    userId: string;
    wodId: string;
    score: string;
    isRx: boolean;
    notes?: string;
  }): Promise<Result> {
    return this.resultModel.findOneAndUpdate(
      { userId: data.userId, wodId: data.wodId },
      data,
      { upsert: true, new: true },
    ).exec();
  }

  async findWodResults(wodId: string): Promise<Result[]> {
    return this.resultModel.find({ wodId }).populate('userId', 'name').exec();
  }

  async findUserResults(userId: string): Promise<Result[]> {
    return this.resultModel.find({ userId }).populate('wodId').sort({ createdAt: -1 }).exec();
  }
}
