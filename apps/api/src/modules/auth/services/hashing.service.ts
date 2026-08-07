import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

@Injectable()
export class HashingService {
  async hash(plain: string): Promise<string> {
    return await bcrypt.hash(plain, SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}
