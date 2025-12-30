import { randomBytes } from "crypto";

export function generateId(length = 8) {
  const bytes = Math.ceil((length * 3) / 4);
  return randomBytes(bytes).toString("base64url").slice(0, length);
}
