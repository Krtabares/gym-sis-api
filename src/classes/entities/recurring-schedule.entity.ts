import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ClassType } from './class-item.entity';

@Schema({ timestamps: true })
export class RecurringSchedule extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ClassType', required: true })
  classTypeId: ClassType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  coachId: string;

  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @Prop({ required: true })
  startTime: string; // "HH:mm"

  @Prop({ required: true })
  capacity: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const RecurringScheduleSchema = SchemaFactory.createForClass(RecurringSchedule);
