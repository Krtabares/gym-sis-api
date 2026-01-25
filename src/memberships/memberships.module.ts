import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { Plan, PlanSchema } from './entities/plan.entity';
import { Subscription, SubscriptionSchema } from './entities/subscription.entity';

import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    BillingModule,
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
