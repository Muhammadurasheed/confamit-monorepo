import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { EscrowService } from '@/modules/escrow/escrow.service';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('create')
  async createEscrow(@Body() body: { 
    buyerEmail: string, 
    vendorAccount: string, 
    vendorName: string, 
    amount: number, 
    itemName: string,
    paystackReference?: string,
    paymentMethod?: 'paystack' | 'hbar'
  }) {
    return this.escrowService.createEscrow(body);
  }

  @Get(':id')
  async getEscrow(@Param('id') id: string) {
    return this.escrowService.getEscrow(id);
  }

  @Post(':id/deposit')
  async depositFunds(@Param('id') id: string) {
    return this.escrowService.depositFunds(id);
  }

  @Post(':id/release')
  async releaseFunds(@Param('id') id: string, @Body() body: { receiptUrl: string }) {
    return this.escrowService.releaseFunds(id, body.receiptUrl);
  }

  @Post(':id/release-pin')
  async releaseFundsWithPin(@Param('id') id: string, @Body() body: { pin: string }) {
    return this.escrowService.releaseFundsWithPin(id, body.pin);
  }
}
