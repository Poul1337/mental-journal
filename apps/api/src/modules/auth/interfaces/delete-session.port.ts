export interface DeleteSessionPort {
  execute(refreshTokenHash: string): Promise<void>;
}

export const DELETE_SESSION_PORT = Symbol('DELETE_SESSION_PORT');
