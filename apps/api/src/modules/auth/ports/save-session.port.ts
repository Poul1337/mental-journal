export interface SaveSessionInput {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface SaveSessionPort {
  execute(input: SaveSessionInput): Promise<void>;
}

export const SAVE_SESSION_PORT = Symbol('SAVE_SESSION_PORT');
