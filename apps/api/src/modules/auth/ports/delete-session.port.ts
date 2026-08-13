export interface DeleteSessionInput {
  refreshTokenHash: string;
}

export interface DeleteSessionPort {
  execute(input: DeleteSessionInput): Promise<void>;
}

export const DELETE_SESSION_PORT = Symbol('DELETE_SESSION_PORT');
