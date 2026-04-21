import { Controller, Post, Get, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

/**
 * Controller de autenticação.
 * Rotas: POST /api/auth/login, GET /api/auth/me
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login — rota pública, não exige token.
   * Retorna access_token JWT e dados básicos do usuário.
   */
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Realiza login e retorna o token JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Retorna os dados do usuário autenticado.
   * Exige token JWT válido no header Authorization.
   */
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Token inválido ou ausente' })
  getMe(@Request() req: { user: any }) {
    return this.authService.getMe(req.user);
  }
}
