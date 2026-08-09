export interface DeleteAllSessionsInput {
  userId: string;
}

export interface DeleteAllSessionsPort {
  execute(input: DeleteAllSessionsInput): Promise<void>;
}

export const DELETE_ALL_SESSIONS_PORT = Symbol('DELETE_ALL_SESSIONS_PORT');
