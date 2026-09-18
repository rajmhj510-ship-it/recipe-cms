const COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");

  const binary = atob(base64);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getSigningKey(): Promise<CryptoKey | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    return null;
  }

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createAdminSession(): Promise<string | null> {
  const key = await getSigningKey();

  if (!key) {
    return null;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const payload = `${expiresAt}.${nonce}`;

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(
  session: string | undefined
): Promise<boolean> {
  if (!session) {
    return false;
  }

  const parts = session.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [expiresAtText, nonce, signatureText] = parts;
  const expiresAt = Number(expiresAtText);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  if (!nonce || !signatureText) {
    return false;
  }

  const key = await getSigningKey();

  if (!key) {
    return false;
  }

  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      new Uint8Array(fromBase64Url(signatureText)),
      new TextEncoder().encode(`${expiresAt}.${nonce}`)
    );
  } catch {
    return false;
  }
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export { COOKIE_NAME };


