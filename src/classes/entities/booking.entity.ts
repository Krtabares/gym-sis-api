import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Schedule', required: true })
  scheduleId: string;

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
