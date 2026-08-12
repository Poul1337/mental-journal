import { Test, TestingModule } from "@nestjs/testing"
import { SessionService } from "./session.service"
import { PrismaService } from "../../prisma/prisma.service"

const TEST_HASH = '$2a$12$eAVkY7a8f3Q2oOVnoGq2Qe/KHr6I3lRYvpXw/oXt6IKXoPKOgmP/O'

describe('SessionService', () => {
    let sessionService: SessionService

    const prismaService = {
        session: {
            create: jest.fn(),
            deleteMany: jest.fn(),
            findUnique: jest.fn(),
        }
    }

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionService,
                { provide: PrismaService, useValue: prismaService }
            ]
        }).compile()

        sessionService = module.get(SessionService)
    })

    describe('saveSession', () => {
        it('should save session', async () => {
            const expiresAt = new Date(Date.now() + 60_000)
            const input = {
                userId: 'user-1',
                refreshTokenHash: TEST_HASH,
                expiresAt,
            }

            prismaService.session.create.mockResolvedValue({})

            await sessionService.saveSession(input)

            expect(prismaService.session.create).toHaveBeenCalledWith({
              data: {
                userId: 'user-1',
                refreshTokenHash: TEST_HASH,
                expiresAt
              }  
            })

        })
    })


    describe('deleteSession', () => {
        it('should delete session', async () => {
            prismaService.session.deleteMany.mockResolvedValue({})

            await sessionService.deleteSession(TEST_HASH)

            expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
                where: {
                    refreshTokenHash: TEST_HASH
                }
            })
        })
    })

    describe('deleteAllSessions', () => {
        it('should delete all sessions', async () => {
            prismaService.session.deleteMany.mockResolvedValue({})

            await sessionService.deleteAllSessions('user-1')

            expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1'
                }
            })
        })
    })

    describe('findByRefreshTokenHash', () => {
        it('should find by refresh token', async () => {
            const expiresAt = new Date(Date.now() + 60_000)
            const session = {
                id: 'session-1',
                userId: 'user-1',
                expiresAt,
                user: {
                  id: 'user-1',
                  anonName: 'TestUser',
                  status: 'ACTIVE',
                  emailVerified: true,
                },
            }

            prismaService.session.findUnique.mockResolvedValue(session)

            const result = await sessionService.findByRefreshTokenHash(TEST_HASH)

            expect(prismaService.session.findUnique).toHaveBeenCalledWith({
                where: { refreshTokenHash: TEST_HASH },
                select: {
                    id: true,
                    userId: true,
                    expiresAt: true,
                    user: {
                    select: {
                        id: true,
                        anonName: true,
                        status: true,
                        emailVerified: true,
                    },
                    },
                },
            })
            expect(result).toEqual(session)
        })
    })
})