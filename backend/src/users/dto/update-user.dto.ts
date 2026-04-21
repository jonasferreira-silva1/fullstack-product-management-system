import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Todos os campos de CreateUserDto tornam-se opcionais no update
export class UpdateUserDto extends PartialType(CreateUserDto) {}
