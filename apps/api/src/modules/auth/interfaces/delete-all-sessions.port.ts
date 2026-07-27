export interface DeleteAllSessionsPort {
    execute(userId: string): Promise<void>
}

export const DELETE_ALL_SESSIONS_PORT = Symbol('DELETE_ALL_SESSIONS_PORT')