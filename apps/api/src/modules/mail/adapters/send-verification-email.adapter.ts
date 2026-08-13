import { Injectable } from '@nestjs/common';

import {
  SendVerificationEmailInput,
  SendVerificationEmailPort,
} from '../../auth/ports/send-verification-email.port';
import { MailService } from '../mail.service';

@Injectable()
export class SendVerificationEmailAdapter implements SendVerificationEmailPort {
  constructor(private readonly mailService: MailService) {}

  async execute({
    to,
    verificationLink,
  }: SendVerificationEmailInput): Promise<void> {
    await this.mailService.sendVerificationEmail({ to, verificationLink });
  }
}
