import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationParams } from '../../shared/interfaces/pagination-params';
import { CreateSupportTicketDto, UpdateSupportTicketDto } from './dto/create-support-ticket.dto';
import { TicketPriority, TicketStatus } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllAdmin(
    filters: { status?: TicketStatus; priority?: TicketPriority; search?: string },
    pagination?: PaginationParams,
  ) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    if (filters.search) {
      where.OR = [
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.paginationService.paginate(
      this.prisma.supportTicket,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          chargePoint: { select: { id: true, ocppId: true, name: true, city: true, zone: true } },
        },
      },
      pagination,
    );
  }

  async findByIdAdmin(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        requester: true,
        assignedTo: true,
        chargePoint: true,
      },
    });

    if (!ticket) throw new NotFoundException(`Ticket SAV ${id} introuvable.`);
    return ticket;
  }

  async createAdmin(requesterId: string, dto: CreateSupportTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        requesterId,
        subject: dto.subject,
        description: dto.description,
        chargePointId: dto.chargePointId,
        assignedToId: dto.assignedToId,
        priority: dto.priority || TicketPriority.MEDIUM,
        status: dto.status || TicketStatus.OPEN,
        slaDueAt: new Date(Date.now() + 4 * 3600_000), // SLA 4h par défaut
      },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        chargePoint: { select: { id: true, ocppId: true, name: true } },
      },
    });
  }

  async updateAdmin(id: string, dto: UpdateSupportTicketDto) {
    await this.findByIdAdmin(id);
    return this.prisma.supportTicket.update({
      where: { id },
      data: dto,
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        chargePoint: { select: { id: true, ocppId: true, name: true } },
      },
    });
  }

  async deleteAdmin(id: string) {
    await this.findByIdAdmin(id);
    return this.prisma.supportTicket.delete({
      where: { id },
    });
  }
}
