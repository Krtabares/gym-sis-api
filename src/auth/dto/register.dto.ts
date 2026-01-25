import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
