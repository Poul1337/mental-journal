export interface SaveSessionPort {
    execute(userId: string, refreshTokenHash: string, expiresAt: Date): Promise<void>
}

export const SAVE_SESSION_PORT = Symbol('SAVE_SESSION_PORT')