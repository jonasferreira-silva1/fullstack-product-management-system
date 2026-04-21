import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controller de auditoria — apenas ADMIN.
 * Consulta paginada com filtros por período, usuário e entidade.
 */
@ApiTags('audit')
@ApiBearerAuth('JWT-auth')
@Controller('audit')
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Lista logs de auditoria (ADMIN)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'startDate', required: false, description: 'ISO 8601' })
  @ApiQuery({ name: 'endDate', required: false, description: 'ISO 8601' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      userId,
      entity,
      startDate,
      endDate,
    });
  }
}
