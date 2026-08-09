import { Injectable } from '@nestjs/common';

import {
  RegisterUserInput,
  RegisterUserPort,
  RegisterUserResult,
} from '../../auth/ports/register-user.port';
import { UserService } from '../user.service';

@Injectable()
export class RegisterUserAdapter implements RegisterUserPort {
  constructor(private readonly userService: UserService) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserResult> {
    const user = await this.userService.registerUser(input);
    return { id: user.id, anonName: user.anonName };
  }
}
