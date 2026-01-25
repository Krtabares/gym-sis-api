import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise, Wod } from './entities/workout-item.entity';
import { CreateWodDto } from './dto/create-wod.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<Exercise>,
    @InjectModel(Wod.name) private wodModel: Model<Wod>,
  ) {}

  private parseDateLocal(input: string | Date): Date {
    // Normalize to local midnight regardless of input format
    if (input instanceof Date) {
      if (isNaN(input.getTime())) return new Date(NaN);
      const d = new Date(input);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (typeof input === 'string') {
      // Accept 'YYYY-MM-DD' or ISO strings
      const dateOnlyMatch = input.match(/^\d{4}-\d{2}-\d{2}$/);
      if (dateOnlyMatch) {
        const [y, m, d] = input.split('-').map((v) => Number(v));
        const local = new Date(y, m - 1, d, 0, 0, 0, 0);
        local.setHours(0, 0, 0, 0);
        return local;
      }
      // Fallback: try Date parsing and then normalize
      const parsed = new Date(input);
      if (!isNaN(parsed.getTime())) {
        parsed.setHours(0, 0, 0, 0);
        return parsed;
      }
      // Last resort: slice first 10 chars if looks like ISO
      const head = input.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(head)) {
        const [y, m, d] = head.split('-').map((v) => Number(v));
        const local = new Date(y, m - 1, d, 0, 0, 0, 0);
        local.setHours(0, 0, 0, 0);
        return local;
      }
    }
    return new Date(NaN);
  }

  // Exercise Management
  async createExercise(data: {
    name: string;
    category?: string;
    description?: string;
  }): Promise<Exercise> {
    const newExercise = new this.exerciseModel(data);
    return newExercise.save();
  }

  async findAllExercises(): Promise<Exercise[]> {
    return this.exerciseModel.find().exec();
  }

  // WOD Management
  async createWod(data: CreateWodDto): Promise<Wod> {
    const date = this.parseDateLocal(data.date);
    const { blocks, notes } = data as any;
    return this.wodModel
      .findOneAndUpdate(
        { date },
        { date, blocks, notes },
        { upsert: true, new: true },
      )
      .exec();
  }

  async findWodByDate(dateStr: string): Promise<Wod | null> {
    const date = this.parseDateLocal(dateStr);
    return this.wodModel.findOne({ date }).exec();
  }

  async findTodayWod(): Promise<Wod | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.wodModel.findOne({ date: today }).exec();
  }

  async updateWod(id: string, data: CreateWodDto): Promise<Wod | null> {
    const date = this.parseDateLocal(data.date);
    const { blocks, notes } = data as any;
    return this.wodModel
      .findByIdAndUpdate(id, { date, blocks, notes }, { new: true })
      .exec();
  }
}
