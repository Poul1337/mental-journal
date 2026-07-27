import { randomBytes, createHash } from "crypto";

export function createRandomToken(expiresInMs: number) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex")
    const expiresAt = new Date(Date.now() + expiresInMs)

    return { token, tokenHash, expiresAt }
}
