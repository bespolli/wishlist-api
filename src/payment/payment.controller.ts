import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(
    @GetUser() user: { id: string },
    @Body('amount') amount: number,
  ) {
    return this.paymentService.createCheckoutSession(user.id, amount);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    return this.paymentService.handleWebhook(signature, req.rawBody);
  }

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@GetUser() user: { id: string }) {
    return this.paymentService.getBalance(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(@GetUser() user: { id: string }) {
    return this.paymentService.getTransactions(user.id);
  }
}
