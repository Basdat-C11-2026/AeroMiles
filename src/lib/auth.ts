import { SignJWT, jwtVerify, JWTPayload } from 'jose';

export interface CustomJWTPayload extends JWTPayload {
  email: string;
  role: 'Member' | 'Staf';
}

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'Aydin bilang gada yang tahu'
);

export async function signToken(payload: CustomJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as CustomJWTPayload;
  } catch (error) {
    return null;
  }
}