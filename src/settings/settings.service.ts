import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@InjectModel(Setting.name) private settingModel: Model<Setting>) {}

  async onModuleInit() {
    // Seed default settings if they don't exist
    const bookingWindow = await this.settingModel.findOne({ key: 'bookingWindowDays' });
    if (!bookingWindow) {
      await this.settingModel.create({ key: 'bookingWindowDays', value: 0 }); // 0 = only same day
    }
  }

  async findAll() {
    const settings = await this.settingModel.find().exec();
    const result: Record<string, any> = {};
    settings.forEach(curr => {
      result[curr.key] = curr.value;
    });
    return result;
  }

  async findOne(key: string) {
    const setting = await this.settingModel.findOne({ key }).exec();
    return setting ? setting.value : null;
  }

  async update(key: string, value: any) {
    return this.settingModel.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    ).exec();
  }
}
