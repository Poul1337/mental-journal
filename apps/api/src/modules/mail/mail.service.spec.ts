import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { MailSendFailedException } from './exceptions/mail-send-failed.exception';
import { MailService } from './mail.service';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

const input = {
  to: 'test@user.pl',
  verificationLink: 'http://localhost:3000/verify-email?token=abc123',
};

describe('MailService', () => {
  let mailService: MailService;

  const configService = {
    getOrThrow: jest.fn((key: string) => {
      const map: Record<string, string> = {
        RESEND_API_KEY: 'test-api-key',
        MAIL_FROM: 'noreply@test.pl',
      };
      return map[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    mailService = module.get(MailService);
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      sendMock.mockResolvedValue({
        data: { id: 'msg-1' },
        error: null,
      });

      await mailService.sendVerificationEmail(input);

      expect(sendMock).toHaveBeenCalledWith({
        from: 'noreply@test.pl',
        to: ['test@user.pl'],
        subject: 'Verify your email',
        html: expect.stringContaining(input.verificationLink),
        text: `Verify your email: ${input.verificationLink}`,
      });
    });

    it('should throw MailSendFailedException when Resend returns error', async () => {
      sendMock.mockResolvedValue({
        data: { id: 'msg-1' },
        error: { message: 'failed' },
      });

      await expect(mailService.sendVerificationEmail(input)).rejects.toThrow(
        MailSendFailedException,
      );
    });
  });
});
