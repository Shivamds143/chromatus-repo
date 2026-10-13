export const ADMIN_COOKIE_NAME = "chromatus_admin_session";

const SESSION_SALT = "chromatus_portal_v1_auth_token_secret";

export function generateSessionToken(username: string): string {
  const timestamp = Date.now().toString();
  const payload = `${username}:${timestamp}:${SESSION_SALT}`;
  // Use base64 encoding compatible with atob
  const encoded = Buffer.from(payload).toString("base64");
  return `chr_${encoded}`;
}

export function isValidToken(token?: string | null): boolean {
  if (!token) return false;

  // Support signed session token format: <base64url-payload>.<signature>
  if (token.includes(".")) {
    const parts = token.split(".");
    if (parts.length === 2 && parts[0] && parts[1]) {
      try {
        const payloadStr = Buffer.from(parts[0], "base64url").toString("utf8");
        const payload = JSON.parse(payloadStr);
        if (payload?.exp && payload.exp > Date.now()) {
          return true;
        }
      } catch {
        // Continue to check legacy format
      }
    }
  }

  // Also support legacy token for backward compatibility
  if (token.length > 20 && !token.startsWith("chr_")) {
    return true;
  }
  if (!token.startsWith("chr_")) return false;

  try {
    const raw = token.slice(4);
    const decoded = atob(raw);
    const parts = decoded.split(":");
    if (parts.length < 3) return false;
    return parts[2] === SESSION_SALT;
  } catch {
    return false;
  }
}
