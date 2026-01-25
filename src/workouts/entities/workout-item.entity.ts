import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Exercise extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  category: string;

  @Prop()
  description: string;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

export enum WodBlockType {
  WARM_UP = 'WARM_UP',
  STRENGTH = 'STRENGTH',
  METCON = 'METCON',
  ACCESSORIES = 'ACCESSORIES',
}

export enum WodMethod {
  AMRAP = 'AMRAP',
  EMOM = 'EMOM',
  TABATA = 'TABATA',
  FOR_TIME = 'FOR_TIME',
  FOR_LOAD = 'FOR_LOAD',
  INTERVALS = 'INTERVALS',
  LADDER = 'LADDER',
  CHIPPER = 'CHIPPER',
}

@Schema({ _id: false })
export class BlockItem {
  @Prop()
  name?: string; // display name if not linked to exercise

  @Prop({ type: String, ref: Exercise.name })
  exerciseId?: string; // optional reference id as string

  @Prop()
  reps?: number;

  @Prop()
  load?: string; // e.g., "50kg" or "bodyweight"

  @Prop()
  time?: string; // e.g., "12min AMRAP"

  @Prop()
  desc?: string; // free-form description/instructions
}

export const BlockItemSchema = SchemaFactory.createForClass(BlockItem);

@Schema({ _id: false })
export class WodBlock {
  @Prop({ type: String, enum: WodBlockType, required: true })
  type: WodBlockType;

  @Prop()
  title?: string;

  @Prop({ type: String, enum: WodMethod })
  method?: WodMethod;

  @Prop()
  sets?: number;

  @Prop()
  time?: string;

  @Prop({ type: [BlockItemSchema], default: [] })
  items: BlockItem[];
}

export const WodBlockSchema = SchemaFactory.createForClass(WodBlock);

@Schema({ timestamps: true })
export class Wod extends Document {
  @Prop({ required: true, unique: true })
  date: Date;

  @Prop({ type: [WodBlockSchema], default: [] })
  blocks: WodBlock[];

  @Prop()
  notes: string;
}

export const WodSchema = SchemaFactory.createForClass(Wod);
