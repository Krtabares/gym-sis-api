import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export enum InvoiceStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subscription' })
  subscriptionId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Prop({ required: true })
  dueDate: Date;

  @Prop()
  paidAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
