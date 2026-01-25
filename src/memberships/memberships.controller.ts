import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // Plans
  @Post('plans')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.membershipsService.createPlan(createPlanDto);
  }

  @Get('plans')
  async findAllPlans() {
    return this.membershipsService.findAllPlans();
  }

  @Get('plans/:id')
  async findPlanById(@Param('id') id: string) {
    return this.membershipsService.findPlanById(id);
  }

  // Subscriptions
  @Post('subscriptions')
  @Roles(UserRole.OWNER, UserRole.ADMIN) // Usually staff assigns memberships, or we'd have a payment gateway
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.membershipsService.createSubscription(createSubscriptionDto);
  }

  @Get('subscriptions/user/:userId')
  async findUserSubscription(@Param('userId') userId: string) {
    return this.membershipsService.findUserSubscription(userId);
  }

  @Get('subscriptions')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async findAllSubscriptions() {
    return this.membershipsService.findAllSubscriptions();
  }
}
