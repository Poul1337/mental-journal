import { Injectable } from '@nestjs/common';

import {
  FindUserByEmailInput,
  FindUserByEmailPort,
  FindUserByEmailResult,
} from '../../auth/ports/find-user-by-email.port';
import { UserService } from '../user.service';

@Injectable()
export class FindUserByEmailAdapter implements FindUserByEmailPort {
  constructor(private readonly userService: UserService) {}

  async execute({
    email,
  }: FindUserByEmailInput): Promise<FindUserByEmailResult | null> {
    const user = await this.userService.findByEmail(email);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      anonName: user.anonName,
      passwordHash: user.passwordHash,
      status: user.status,
      emailVerified: user.emailVerified,
    };
  }
}
