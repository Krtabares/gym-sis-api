import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';

@Injectable()
export class BillingService {
  constructor(@InjectModel(Invoice.name) private invoiceModel: Model<Invoice>) {}

  async createInvoice(data: {
    userId: string;
    subscriptionId: string;
    amount: number;
    dueDate: Date;
  }): Promise<Invoice> {
    const newInvoice = new this.invoiceModel({
      ...data,
      status: InvoiceStatus.PENDING,
    });
    return newInvoice.save();
  }

  async findUserInvoices(userId: string): Promise<Invoice[]> {
    return this.invoiceModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoiceModel.find().populate('userId').sort({ createdAt: -1 }).exec();
  }

  async markAsPaid(invoiceId: string): Promise<Invoice | null> {
    return this.invoiceModel
      .findByIdAndUpdate(
        invoiceId,
        { status: InvoiceStatus.PAID, paidAt: new Date() },
        { new: true },
      )
      .exec();
  }
}
