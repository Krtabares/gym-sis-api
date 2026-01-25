import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class CheckIn extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ required: true })
  status: string; // GRANTED, DENIED

  @Prop()
  reason: string;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);
