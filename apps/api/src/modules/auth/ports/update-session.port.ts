export interface UpdateSessionInput {
  oldHash: string;
  newHash: string;
  expiresAt: Date;
}

export interface UpdateSessionPort {
  execute(input: UpdateSessionInput): Promise<void>;
}

export const UPDATE_SESSION_PORT = Symbol('UPDATE_SESSION_PORT');
