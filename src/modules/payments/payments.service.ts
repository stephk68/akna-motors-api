import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationParams } from '../../shared/interfaces/pagination-params';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/create-payment.dto';
import { PaymentProvider, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllAdmin(
    filters: { status?: PaymentStatus; provider?: PaymentProvider; search?: string },
    pagination?: PaginationParams,
  ) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.provider) where.provider = filters.provider;

    if (filters.search) {
      where.OR = [
        { providerRef: { contains: filters.search, mode: 'insensitive' } },
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.paginationService.paginate(
      this.prisma.payment,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          session: { select: { id: true, energyKwh: true, durationSec: true, chargePoint: { select: { name: true, ocppId: true } } } },
          invoice: true,
        },
      },
      pagination,
    );
  }

  async findByIdAdmin(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        session: true,
        invoice: true,
      },
    });

    if (!payment) throw new NotFoundException(`Paiement ${id} introuvable.`);
    return payment;
  }

  async create(dto: CreatePaymentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        userId: dto.userId,
        sessionId: dto.sessionId,
        provider: dto.provider,
        amountFcfa: dto.amountFcfa,
        status: dto.status || PaymentStatus.CONFIRMED,
        providerRef: dto.providerRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Auto-generate invoice if payment is confirmed
    if (payment.status === PaymentStatus.CONFIRMED) {
      const invCount = await this.prisma.invoice.count();
      const invNumber = `FAC-2026-${String(invCount + 1).padStart(4, '0')}`;
      await this.prisma.invoice.create({
        data: {
          paymentId: payment.id,
          number: invNumber,
        },
      });
    }

    return this.findByIdAdmin(payment.id);
  }

  async updateStatus(id: string, dto: UpdatePaymentDto) {
    await this.findByIdAdmin(id);
    const updated = await this.prisma.payment.update({
      where: { id },
      data: dto,
      include: { invoice: true },
    });

    // Generate invoice if updated to CONFIRMED and has no invoice
    if (updated.status === PaymentStatus.CONFIRMED && !updated.invoice) {
      const invCount = await this.prisma.invoice.count();
      const invNumber = `FAC-2026-${String(invCount + 1).padStart(4, '0')}`;
      await this.prisma.invoice.create({
        data: {
          paymentId: updated.id,
          number: invNumber,
        },
      });
    }

    return this.findByIdAdmin(id);
  }

  async findAllInvoicesAdmin(pagination?: PaginationParams) {
    return this.paginationService.paginate(
      this.prisma.invoice,
      {
        orderBy: { createdAt: 'desc' },
        include: {
          payment: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      },
      pagination,
    );
  }
}
