import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ClassType extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;
}

export const ClassTypeSchema = SchemaFactory.createForClass(ClassType);

@Schema({ timestamps: true })
export class Schedule extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ClassType', required: true })
  classTypeId: ClassType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  coachId: string;

  @Prop({ required: true })
  dateTime: Date;

  @Prop({ required: true })
  capacity: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  attendees: string[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
