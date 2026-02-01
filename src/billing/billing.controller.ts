 import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
 import { BillingService } from './billing.service';
 import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
 import { RolesGuard } from '../auth/guards/roles.guard';
 import { Roles } from '../auth/decorators/roles.decorator';
 import { UserRole } from '../users/entities/user.entity';
 
 @Controller('billing')
 @UseGuards(JwtAuthGuard, RolesGuard)
 export class BillingController {
   constructor(private readonly billingService: BillingService) {}
 
   @Get('invoices')
   @Roles(UserRole.OWNER, UserRole.ADMIN)
   async findAllInvoices() {
     return this.billingService.findAllInvoices();
   }
 
   @Get('my-invoices')
   async findMyInvoices(@Request() req: any) {
     return this.billingService.findUserInvoices(req.user.userId);
   }
 
   @Get('invoices/user/:userId')

  async findUserInvoices(@Param('userId') userId: string) {
    return this.billingService.findUserInvoices(userId);
  }

  @Post('invoices/:id/pay')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async markAsPaid(@Param('id') id: string) {
    return this.billingService.markAsPaid(id);
  }
}
