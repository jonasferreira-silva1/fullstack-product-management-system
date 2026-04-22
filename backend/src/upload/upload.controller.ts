import {
  Controller, Post, UseInterceptors, UploadedFile,
  BadRequestException, Request, Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';

// Tipos de arquivo permitidos para imagens
const TIPOS_PERMITIDOS = /\.(jpg|jpeg|png|webp)$/i;
// Tamanho máximo: 5MB
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

/**
 * Configuração do storage do Multer — salva em /uploads com nome único.
 */
function criarStorage(subpasta: string) {
  return diskStorage({
    destination: `./uploads/${subpasta}`,
    filename: (_req, file, cb) => {
      const sufixo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${sufixo}${extname(file.originalname)}`);
    },
  });
}

function validarArquivo(file: Express.Multer.File) {
  if (!TIPOS_PERMITIDOS.test(extname(file.originalname))) {
    throw new BadRequestException('Tipo de arquivo inválido. Use JPG, PNG ou WebP.');
  }
  if (file.size > TAMANHO_MAXIMO) {
    throw new BadRequestException('Arquivo muito grande. Máximo: 5MB.');
  }
}

@ApiTags('upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
export class UploadController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upload de foto de perfil do usuário logado.
   * Retorna a URL pública do arquivo salvo.
   */
  @Post('avatar')
  @ApiOperation({ summary: 'Upload de foto de perfil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: criarStorage('avatars') }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    validarArquivo(file);

    const url = `/uploads/avatars/${file.filename}`;

    // Atualiza o avatarUrl do usuário no banco
    await this.prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: url },
    });

    return { url };
  }

  /**
   * Upload de imagem de produto.
   * Retorna a URL pública do arquivo salvo.
   */
  @Post('product/:id')
  @ApiOperation({ summary: 'Upload de imagem de produto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: criarStorage('products') }))
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') productId: string,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    validarArquivo(file);

    const url = `/uploads/products/${file.filename}`;

    // Verifica se o produto existe antes de atualizar
    const produto = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!produto) {
      // Remove o arquivo enviado para não deixar lixo
      const fs = await import('fs');
      fs.unlink(file.path, () => {});
      throw new BadRequestException(`Produto com ID "${productId}" não encontrado. Use um ID válido.`);
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: url },
    });

    return { url };
  }
}
