import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from './entities/plan.entity';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<Plan>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
    private billingService: BillingService,
  ) {}

  // Plan Management
  async createPlan(createPlanDto: CreatePlanDto): Promise<Plan> {
    const newPlan = new this.planModel(createPlanDto);
    return newPlan.save();
  }

  async findAllPlans(): Promise<Plan[]> {
    return this.planModel.find({ isActive: true }).exec();
  }

  async findPlanById(id: string): Promise<Plan> {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  // Subscription Management
  async createSubscription(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.findPlanById(createSubscriptionDto.planId);
    
    // Calculate end date based on plan duration
    const startDate = new Date(createSubscriptionDto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // Cancel any previous active subscriptions for this user
    await this.subscriptionModel.updateMany(
      { userId: createSubscriptionDto.userId, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.CANCELLED },
    );

    const newSubscription = new this.subscriptionModel({
      ...createSubscriptionDto,
      endDate,
      status: SubscriptionStatus.ACTIVE,
    });

    const savedSubscription = await newSubscription.save();

    // Create Invoice
    await this.billingService.createInvoice({
      userId: createSubscriptionDto.userId,
      subscriptionId: (savedSubscription._id as any).toString(),
      amount: plan.price,
      dueDate: new Date(), // Due immediately or after some days
    });

    return savedSubscription;
  }

  async findUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionModel
      .findOne({ userId, status: SubscriptionStatus.ACTIVE })
      .populate('planId')
      .exec();
  }

  async findAllSubscriptions(): Promise<Subscription[]> {
    return this.subscriptionModel.find().populate('userId').populate('planId').exec();
  }
}
