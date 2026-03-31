import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!, {
        apiVersion: '2026-02-25.clover',
    });
  }

  async createCheckoutSession(userId: string, amount: number) {
    if (amount < 100) {
      throw new BadRequestException('Minimum amount is $1.00 (100 cents)');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let stripeCustomerId = (user as any).stripeCustomerId as string | null;

    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });

      await (this.prisma.user as any).update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });

      stripeCustomerId = customer.id;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Balance Top-Up',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: this.config.get<string>('FRONTEND_URL') + '/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: this.config.get<string>('FRONTEND_URL') + '/payment/cancel',
      metadata: { userId },
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    });

    await (this.prisma as any).transaction.create({
      data: {
        userId,
        stripeSessionId: session.id,
        amount,
        currency: 'usd',
        status: 'PENDING',
      },
    });

    await (this.prisma.user as any).update({
      where: { id: userId },
      data: {
        balancePending: { increment: amount },
        balanceTotal: { increment: amount },
      },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')!;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.handleSuccessfulPayment(session);
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.handleExpiredPayment(session);
    }

    return { received: true };
  }

  private async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const transaction = await (this.prisma as any).transaction.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (!transaction || transaction.status !== 'PENDING') return;

    await this.prisma.$transaction([
      (this.prisma as any).transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          stripePaymentIntentId: session.payment_intent as string,
        },
      }),
      (this.prisma.user as any).update({
        where: { id: transaction.userId },
        data: {
          balancePending: { decrement: transaction.amount },
          balanceAvailable: { increment: transaction.amount },
        },
      }),
    ]);
  }

  private async handleExpiredPayment(session: Stripe.Checkout.Session) {
    const transaction = await (this.prisma as any).transaction.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (!transaction || transaction.status !== 'PENDING') return;

    await this.prisma.$transaction([
      (this.prisma as any).transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      }),
      (this.prisma.user as any).update({
        where: { id: transaction.userId },
        data: {
          balancePending: { decrement: transaction.amount },
          balanceTotal: { decrement: transaction.amount },
        },
      }),
    ]);
  }

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return {
      balanceAvailable: (user as any)?.balanceAvailable ?? 0,
      balancePending: (user as any)?.balancePending ?? 0,
      balanceTotal: (user as any)?.balanceTotal ?? 0,
    };
  }

  async getTransactions(userId: string) {
    return (this.prisma as any).transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
