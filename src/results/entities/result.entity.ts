import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Result extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Wod', required: true })
  wodId: string;

  @Prop({ required: true })
  score: string; // e.g., "12:30", "150kg", "50 reps"

  @Prop({ default: true })
  isRx: boolean;

  @Prop()
  notes: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
