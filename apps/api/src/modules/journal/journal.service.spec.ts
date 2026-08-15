import { Test, TestingModule } from "@nestjs/testing"

import { EntryStatus, EntryVisibility } from "../../generated/prisma/enums"
import { PrismaService } from "../../prisma/prisma.service"
import { ENTRIES_LIST_TAKE } from "./consts/entry.const";
import { CreateEntryDto } from "./dtos/create-entry.dto";
import { ListEntriesQueryDto } from "./dtos/list-entries-query.dto";
import { UpdateEntryDto } from "./dtos/update-entry.dto";
import { EntryNotFoundException } from "./exceptions/entry-not-found.exception";
import { JournalService } from "./journal.service"

const USER_ID = 'user-1';
const ENTRY_ID = 'entry-1';

const makeCreateEntryDto = (
    overrides: Partial<CreateEntryDto> = {}
): CreateEntryDto => ({
    content: 'Test content',
    mood: 5,
    tags: ['therapy', 'need_support'],
    visibility: EntryVisibility.PRIVATE,
    ...overrides,
})

const makeFindAllEntriesDto = (
    overrides: Partial<ListEntriesQueryDto> = {}
): ListEntriesQueryDto => ({
    ...overrides
})

const makeEntry = (overrides: Partial<{
    id: string;
    content: string;
    mood: number | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}> = {}) => ({
    id: 'entry-1',
    content: 'Test content',
    mood: 3,
    tags: ['therapy'],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
});

const makeUpdateEntryDto = (
    overrides: Partial<UpdateEntryDto> = {}
): UpdateEntryDto => ({
    content: 'Updated content test',
    mood: 5,
    tags: ['evening_summary', 'weekly_goals'],
    visibility: EntryVisibility.PUBLIC,
    ...overrides
})

describe('journalService', () => {
    let journalService: JournalService

    const prismaService = {
        journalEntry: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn()
        }
    }

    beforeEach(async () => {
        jest.clearAllMocks()

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JournalService,
                { provide: PrismaService, useValue: prismaService }
            ]
        }).compile()

        journalService = module.get(JournalService)
    })

    describe('create', () => {
        it('should create new entry', async () => {
            const dto = makeCreateEntryDto()

            prismaService.journalEntry.create.mockResolvedValue({
                id: ENTRY_ID
            })

            const result = await journalService.create(dto, USER_ID)

            expect(prismaService.journalEntry.create).toHaveBeenCalledWith({
                data: {
                    userId: USER_ID,
                    content: dto.content,
                    mood: dto.mood,
                    tags: dto.tags,
                    visibility: dto.visibility,
                },
            })
            expect(result).toEqual({ id: ENTRY_ID })
        })
    })

    describe('findAll', () => {
        it('should return a page and hasMore when take+1 rows come back', async () => {
            const dto = makeFindAllEntriesDto()
            const entries = Array.from({ length: ENTRIES_LIST_TAKE + 1 }, (_, i) =>
                makeEntry({ id: `entry-${i}` }),
            );

            prismaService.journalEntry.findMany.mockResolvedValue(entries);

            const result = await journalService.findAll(USER_ID, dto);

            expect(prismaService.journalEntry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  take: ENTRIES_LIST_TAKE + 1,
                  where: expect.objectContaining({
                    userId: USER_ID,
                    deletedAt: null,
                  }),
                }),
              );
            expect(result.items).toHaveLength(ENTRIES_LIST_TAKE);
            expect(result.meta.hasMore).toBe(true);
            expect(result.meta.nextCursor).toEqual({
                id: entries[ENTRIES_LIST_TAKE - 1].id,
                createdAt: entries[ENTRIES_LIST_TAKE - 1].createdAt,
            });
        })

        it('should apply createdAt cursor on the next page', async () => {
            const lastCreatedAt = new Date('2026-01-01T00:00:00.000Z');

            const dto = makeFindAllEntriesDto({
              lastCursorId: ENTRY_ID,
              lastCreatedAt,
            });

            prismaService.journalEntry.findMany.mockResolvedValue([]);

            await journalService.findAll(USER_ID, dto);
            
            expect(prismaService.journalEntry.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  userId: USER_ID,
                  deletedAt: null,
                  OR: [
                    { createdAt: { lt: lastCreatedAt } },
                    { createdAt: lastCreatedAt, id: { lt: ENTRY_ID } },
                  ],
                }),
              }),
            );
        })

        it('should return all items and no cursor when a short page comes back', async () => {
            const entries = [makeEntry({ id: ENTRY_ID }), makeEntry({ id: 'entry-2' })];

            prismaService.journalEntry.findMany.mockResolvedValue(entries);

            const result = await journalService.findAll(USER_ID, makeFindAllEntriesDto());

            expect(result.items).toHaveLength(2);
            expect(result.meta.hasMore).toBe(false);
            expect(result.meta.nextCursor).toBeNull();
        });

        it('should return all items sorted by mood', async () => {
            const dto = makeFindAllEntriesDto({ sortBy: 'mood' })
            const entries = Array.from({ length: ENTRIES_LIST_TAKE + 1 }, (_, index) => (
                makeEntry({ id: `entry-${index}` })
            ))

            prismaService.journalEntry.findMany.mockResolvedValue(entries);

            const result = await journalService.findAll(USER_ID, dto);

            expect(prismaService.journalEntry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [{ mood: 'desc' }, { id: 'desc' }],
                }),
              );
            expect(result.items).toHaveLength(ENTRIES_LIST_TAKE);
            expect(result.meta.nextCursor).toEqual({
                id: entries[ENTRIES_LIST_TAKE - 1].id,
                mood: entries[ENTRIES_LIST_TAKE - 1].mood,
            });
        })
    })

    describe('findOne', () => {
        it('should return one entry', async () => {
            const entry = makeEntry()
            prismaService.journalEntry.findFirst.mockResolvedValue(entry)

            const result = await journalService.findOne(USER_ID, entry.id)


            expect(prismaService.journalEntry.findFirst).toHaveBeenCalledWith({
                where: {
                id: entry.id,
                userId: USER_ID,
                status: EntryStatus.ACTIVE,
                deletedAt: null,
                },
            });
            expect(result).toEqual({
                id: entry.id,
                content: entry.content,
                mood: entry.mood,
                tags: entry.tags,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
            });
        })

        it('should throw EntryNotFoundException when entry do not exists' , async () => {
            prismaService.journalEntry.findFirst.mockResolvedValue(null)

            await expect(journalService.findOne(USER_ID, 'entry-1')).rejects.toThrow(EntryNotFoundException)
        })
    })

    describe('update', () => {
        it('should update entry', async () => {
            const dto = makeUpdateEntryDto()
            
            prismaService.journalEntry.findFirst.mockResolvedValue(makeEntry({ id: ENTRY_ID }))
            prismaService.journalEntry.update.mockResolvedValue({ id: ENTRY_ID })

            const result = await journalService.update(USER_ID, ENTRY_ID, dto)

            expect(prismaService.journalEntry.update).toHaveBeenCalledWith({
                where: { id: ENTRY_ID },
                data: {
                    content: dto.content,
                    mood: dto.mood,
                    tags: dto.tags,
                    visibility: dto.visibility,
                },
                select: {
                    id: true
                }
            })
            expect(result).toEqual({ id: ENTRY_ID })
        })
    })

    describe('delete', () => {
        it('should update deletedAt entry field', async () => {
            prismaService.journalEntry.findFirst.mockResolvedValue(makeEntry({ id: ENTRY_ID }))
            prismaService.journalEntry.update.mockResolvedValue({ id: ENTRY_ID })

            const result = await journalService.delete(USER_ID, ENTRY_ID)

            expect(prismaService.journalEntry.update).toHaveBeenCalledWith({
                where: { id: ENTRY_ID },
                data: {
                    deletedAt: expect.any(Date),
                },
                select: {
                    id: true,
                },
            })
            expect(result).toEqual({ id: ENTRY_ID })
        })
    })
})