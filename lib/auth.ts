import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_KEY = process.env.JWT_SECRET || 'fallback-dev-secret-change-me';

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET_KEY);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string): Promise<boolean> {
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash) return false;
  const inputHash = await hashPassword(password);
  return inputHash === storedHash.toLowerCase();
}

export async function createToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}
