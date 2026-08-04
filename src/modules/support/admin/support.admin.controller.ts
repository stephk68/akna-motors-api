import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role, TicketStatus, TicketPriority } from '@prisma/client';
import { SupportService } from '../support.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { CreateSupportTicketDto, UpdateSupportTicketDto } from '../dto/create-support-ticket.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/tickets')
export class SupportAdminController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des tickets SAV & maintenance (paginé, filtres)' })
  async findAll(@Req() req: CustomRequest) {
    const filters = req.filters || {};
    const result = await this.supportService.findAllAdmin(
      {
        status: req.query.status as TicketStatus,
        priority: req.query.priority as TicketPriority,
        search: filters.search,
      },
      req.pagination,
    );
    return { data: result, message: 'Liste des tickets SAV récupérée' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un ticket SAV' })
  async findOne(@Param('id') id: string) {
    const ticket = await this.supportService.findByIdAdmin(id);
    return { data: ticket };
  }

  @Post()
  @ApiOperation({ summary: 'Créer un ticket SAV / maintenance' })
  async create(@Req() req: CustomRequest, @Body() dto: CreateSupportTicketDto) {
    const requesterId = req.user.id;
    const ticket = await this.supportService.createAdmin(requesterId, dto);
    return { data: ticket, message: 'Ticket créé avec succès' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un ticket (statut, priorité, technicien)' })
  async update(@Param('id') id: string, @Body() dto: UpdateSupportTicketDto) {
    const ticket = await this.supportService.updateAdmin(id, dto);
    return { data: ticket, message: 'Ticket mis à jour' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un ticket SAV' })
  async delete(@Param('id') id: string) {
    await this.supportService.deleteAdmin(id);
    return { data: null, message: 'Ticket supprimé' };
  }
}
