import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controller de relatórios — apenas ADMIN.
 */
@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo geral: totais de usuários, produtos e categorias' })
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Relatório detalhado com filtros por período, usuário e entidade' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getDetailed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDetailed({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      userId,
      entity,
      startDate,
      endDate,
    });
  }

  @Get('top-favorited')
  @ApiOperation({ summary: 'Produtos mais favoritados' })
  getTopFavorited(@Query('limit') limit?: string) {
    return this.reportsService.getTopFavorited(limit ? Number(limit) : 10);
  }
}
