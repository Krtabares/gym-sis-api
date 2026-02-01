import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ListSubscriptionsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // When true, include CANCELLED in results; default is false
  @IsOptional()
  @IsBooleanString()
  includeCancelled?: string; // 'true' | 'false'

  // Sorting: default by endDate ascending
  @IsOptional()
  @IsString()
  sortBy?: string = 'endDate';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  // Text search by user name/email or plan name
  @IsOptional()
  @IsString()
  search?: string;

  // Optional status filter
  @IsOptional()
  @IsIn(['ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED'])
  status?: 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';

  // Threshold in days to flag items as expiring soon (computed on server)
  @IsOptional()
  @IsInt()
  @Min(1)
  thresholdDays?: number = 7;
}
