import { Injectable } from '@nestjs/common';

import {
  FindUserByIdPort,
  FindUserByIdResult,
} from '../ports/find-user-by-id.port';
import { UserService } from '../user.service';

@Injectable()
export class FindUserByIdAdapter implements FindUserByIdPort {
  constructor(private readonly userService: UserService) {}

  async execute(id: string): Promise<FindUserByIdResult | null> {
    return await this.userService.findById(id);
  }
}
