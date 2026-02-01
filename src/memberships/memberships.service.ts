import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from './entities/plan.entity';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { BillingService } from '../billing/billing.service';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<Plan>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
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
  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const plan = await this.findPlanById(createSubscriptionDto.planId);

    // Calculate end date based on plan duration
    const startDate = new Date(createSubscriptionDto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // Cancel any previous active subscriptions for this user
    await this.subscriptionModel.updateMany(
      {
        userId: createSubscriptionDto.userId,
        status: SubscriptionStatus.ACTIVE,
      },
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

  async findAllSubscriptions(query: ListSubscriptionsDto): Promise<{
    items: (Subscription & { isExpiringSoon?: boolean })[] | any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const normalize = (val: unknown, def: string): string => {
      const s = typeof val === 'string' ? val : undefined;
      return !s || s === 'undefined' || s === 'null' ? def : s;
    };
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const includeCancelled =
      normalize(query.includeCancelled, 'false') === 'true';
    const sortBy = normalize(query.sortBy, 'endDate') as string;
    const sortOrder = normalize(query.sortOrder, 'asc') === 'desc' ? -1 : 1;
    const search = normalize(query.search, '').trim();

    const filter: Record<string, any> = {};
    if (query.status) {
      filter.status = query.status;
    } else if (!includeCancelled) {
      filter.status = {
        $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
      };
    }

    let items: any[] = [];
    let total = 0;

    if (search) {
      const regex = new RegExp(search, 'i');
      const pipeline: any[] = [
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'plans',
            localField: 'planId',
            foreignField: '_id',
            as: 'planId',
          },
        },
        { $unwind: { path: '$planId', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { 'userId.name': regex },
              { 'userId.email': regex },
              { 'planId.name': regex },
            ],
          },
        },
        { $sort: { [sortBy]: sortOrder } },
        {
          $facet: {
            items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        },
      ];
      const faceted = await this.subscriptionModel.aggregate(pipeline).exec();
      items = faceted[0]?.items ?? [];
      total = faceted[0]?.total?.[0]?.count ?? 0;
    } else {
      const result = await Promise.all([
        this.subscriptionModel
          .find(filter)
          .populate('userId')
          .populate('planId')
          .sort({ [sortBy]: sortOrder })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec(),
        this.subscriptionModel.countDocuments(filter).exec(),
      ]);
      items = result[0] as any[];
      total = result[1] as number;
    }

    const thresholdDaysRaw = query.thresholdDays as any;
    const thresholdDays =
      typeof thresholdDaysRaw === 'number'
        ? thresholdDaysRaw
        : parseInt(thresholdDaysRaw) || 7;
    const now = new Date();
    const soonMs = thresholdDays * 24 * 60 * 60 * 1000;

    const itemsWithFlag = items.map((s: any) => {
      const doc = s._doc ? s._doc : s;
      const end = new Date(doc.endDate);
      const status = doc.status;
      
      // Calculate diff in days properly
      const diffMs = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      const isSoon =
        status === SubscriptionStatus.ACTIVE &&
        diffDays <= thresholdDays &&
        diffDays >= -1; // Include today and just expired today
        
      return { ...doc, isExpiringSoon: !!isSoon };
    });

    return { items: itemsWithFlag, total, page, limit };
  }
}
