import { randomBytes, createHash } from "crypto";

export function createEmailVerificationToken() {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex")
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    return { token, tokenHash, expiresAt }
}