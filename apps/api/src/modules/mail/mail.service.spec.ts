import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "./mail.service"
import { ConfigService } from "@nestjs/config";

const sendMock = jest.fn();

jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: { send: sendMock }
    }))
}))

describe('MailService', () => {
    let mailService: MailService;

    const configService = {
        getOrThrow: jest.fn((key: string) => {
            const map: Record<string, string> = {
                RESEND_API_KEY: 'test-api-key',
                MAIL_FROM: 'noreply@test.pl'
            }
            return map[key]
        })
    }

    beforeEach(async () => {
        jest.clearAllMocks()

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                { provide: ConfigService, useValue: configService },
            ]
        }).compile()

        mailService = module.get(MailService)
    })

   describe('sendVerificationEmail', () => {
    it('should send verification email', async () => { 
        const input = {
            to: 'test@user.pl',
            verificationLink: 'http://localhost:3000/verify-email?token=abc123'
        } 

        sendMock.mockResolvedValue({
            data: { id: 'msg-1' },
            error: null
        })

        await mailService.sendVerificationEmail(input)

        expect(sendMock).toHaveBeenCalledWith({
            from: 'noreply@test.pl',
            to: ['test@user.pl'],
            subject: 'Test Subject',
            html: expect.stringContaining(input.verificationLink),
            text: `Verify your email: ${input.verificationLink}`,
        })
    })

    it('should throw MailSendFailedException when Resend returns error', async () => {

    })
   })
})