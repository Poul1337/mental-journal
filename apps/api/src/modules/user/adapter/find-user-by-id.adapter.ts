import { Injectable } from '@nestjs/common';

import { FindUserByIdPort } from '../interfaces/find-user-by-id.port';
import { FindUserByIdResult } from '../interfaces/find-user-by-id-result';
import { UserService } from '../user.service';

@Injectable()
export class FindUserByIdAdapter implements FindUserByIdPort {
  constructor(private readonly userService: UserService) {}

  async execute(id: string): Promise<FindUserByIdResult | null> {
    return await this.userService.findById(id);
  }
}
