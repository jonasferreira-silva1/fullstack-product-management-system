import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de entrada para o endpoint de login.
 * Valida e documenta os campos obrigatórios.
 */
export class LoginDto {
  @ApiProperty({ example: 'admin@desafio.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}
