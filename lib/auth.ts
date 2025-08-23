import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  if (!token) return null;
  
  const payload = await decrypt(token);
  return payload?.user || null;
}

export async function getCustomerFromRequest(request: NextRequest) {
  const token = request.cookies.get('customer-token')?.value;
  if (!token) return null;
  
  const payload = await decrypt(token);
  return payload?.customer || null;
}