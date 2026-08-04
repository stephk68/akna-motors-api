import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role, PaymentProvider, PaymentStatus } from '@prisma/client';
import { PaymentsService } from '../payments.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/create-payment.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class PaymentsAdminController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('payments')
  @ApiOperation({ summary: 'Liste des transactions de paiement (paginé, filtres)' })
  async findAllPayments(@Req() req: CustomRequest) {
    const filters = req.filters || {};
    const result = await this.paymentsService.findAllAdmin(
      {
        status: req.query.status as PaymentStatus,
        provider: req.query.provider as PaymentProvider,
        search: filters.search,
      },
      req.pagination,
    );
    return { data: result, message: 'Liste des transactions récupérée' };
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Détail d\'un paiement' })
  async findOnePayment(@Param('id') id: string) {
    const payment = await this.paymentsService.findByIdAdmin(id);
    return { data: payment };
  }

  @Post('payments')
  @ApiOperation({ summary: 'Enregistrer une transaction de paiement' })
  async createPayment(@Body() dto: CreatePaymentDto) {
    const payment = await this.paymentsService.create(dto);
    return { data: payment, message: 'Transaction de paiement enregistrée' };
  }

  @Patch('payments/:id')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un paiement' })
  async updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    const payment = await this.paymentsService.updateStatus(id, dto);
    return { data: payment, message: 'Paiement mis à jour' };
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Liste des factures générées' })
  async findAllInvoices(@Req() req: CustomRequest) {
    const result = await this.paymentsService.findAllInvoicesAdmin(req.pagination);
    return { data: result, message: 'Factures récupérées avec succès' };
  }
}
