import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { MailSendFailedException } from './exception/mail-send-failed.exception';
import { verificationEmailContent } from './templates/verification.email';

interface SendParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly resend: Resend;

  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
    this.from = this.configService.getOrThrow<string>('MAIL_FROM');
  }

  async sendVerificationEmail(
    to: string,
    verificationLink: string,
  ): Promise<void> {
    const content = verificationEmailContent(verificationLink);

    await this.send({
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });
  }

  private async send(params: SendParams): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (error) {
        this.logger.error(`Failed to send mail to ${params.to}`, error);
        throw new MailSendFailedException();
      }

      this.logger.log(
        `Mail send to: ${params.to} (id=${data.id ?? 'unknown'})`,
      );
    } catch (error) {
      if (error instanceof MailSendFailedException) throw error;
      this.logger.error(`Resend request failed for ${params.to}`, error);
      throw new MailSendFailedException();
    }
  }
}
