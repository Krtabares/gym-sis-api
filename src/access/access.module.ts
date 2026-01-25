import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { CheckIn, CheckInSchema } from './entities/checkin.entity';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CheckIn.name, schema: CheckInSchema }]),
    MembershipsModule,
  ],
  controllers: [AccessController],
  providers: [AccessService],
})
export class AccessModule {}
