import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority, TicketStatus } from '@prisma/client';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'Câble endommagé / Connecteur bloqué' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ example: 'Le connecteur ne se déverrouille pas après la fin de session.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'chargepoint-uuid' })
  @IsOptional()
  @IsString()
  chargePointId?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ enum: TicketStatus, default: TicketStatus.OPEN })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}

export class UpdateSupportTicketDto {
  @ApiPropertyOptional({ example: 'Câble endommagé' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Intervention planifiée' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'technician-uuid' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
