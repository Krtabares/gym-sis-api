export enum WodBlockTypeDto {
  WARM_UP = 'WARM_UP',
  STRENGTH = 'STRENGTH',
  METCON = 'METCON',
  ACCESSORIES = 'ACCESSORIES',
}

export enum WodMethodDto {
  AMRAP = 'AMRAP',
  EMOM = 'EMOM',
  TABATA = 'TABATA',
  FOR_TIME = 'FOR_TIME',
  FOR_LOAD = 'FOR_LOAD',
  INTERVALS = 'INTERVALS',
  LADDER = 'LADDER',
  CHIPPER = 'CHIPPER',
}

export class BlockItemDto {
  name?: string;
  exerciseId?: string;
  reps?: number;
  load?: string;
  time?: string;
  desc?: string;
}

export class CreateWodBlockDto {
  type: WodBlockTypeDto;
  title?: string;
  method?: WodMethodDto;
  sets?: number;
  time?: string;
  items: BlockItemDto[];
}

export class CreateWodDto {
  date: string | Date;
  blocks: CreateWodBlockDto[];
  notes?: string;
}
