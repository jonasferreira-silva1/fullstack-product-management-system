import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

/**
 * Serviço de autenticação.
 * Responsável por validar credenciais e gerar tokens JWT.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida as credenciais e retorna um access_token JWT.
   * Lança UnauthorizedException se email ou senha forem inválidos.
   */
  async login(dto: LoginDto) {
    // Busca o usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Mensagem genérica para não revelar se o email existe
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Compara a senha enviada com o hash armazenado
    const senhaValida = await bcrypt.compare(dto.password, user.password);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Monta o payload do token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Retorna os dados do usuário autenticado (extraídos do token JWT).
   */
  getMe(user: { id: string; name: string; email: string; role: string }) {
    return user;
  }
}
