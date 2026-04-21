import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria produto' })
  create(@Body() dto: CreateProductDto, @Request() req: any) {
    return this.productsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista produtos com filtros e paginação' })
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Lista produtos favoritos do usuário logado' })
  findFavorites(@Request() req: any) {
    return this.productsService.findFavorites(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca produto por ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza produto (criador ou ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Request() req: any) {
    return this.productsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove produto (criador ou ADMIN)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productsService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Adiciona produto aos favoritos' })
  addFavorite(@Param('id') id: string, @Request() req: any) {
    return this.productsService.addFavorite(id, req.user.id);
  }

  @Delete(':id/favorite')
  @ApiOperation({ summary: 'Remove produto dos favoritos' })
  removeFavorite(@Param('id') id: string, @Request() req: any) {
    return this.productsService.removeFavorite(id, req.user.id);
  }
}
