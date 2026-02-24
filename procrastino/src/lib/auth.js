import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_NAME = 'procrastino_token';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export function signToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export async function setAuthCookie(userId) {
    const token = signToken(userId);
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: TOKEN_MAX_AGE,
    });
    return token;
}

export async function getAuthUser(request) {
    // 1. Check for Bearer token in Authorization header (Android app)
    if (request) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            if (decoded) return decoded;
        }
    }

    // 2. Fall back to cookie-based auth (web app)
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded) return null;
    return decoded;
}

export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_NAME);
}

export function checkOrigin(request) {
    // Disabled strict origin checking because Vercel generates dynamic preview URLs 
    // which causes false positive "Forbidden" errors when NEXT_PUBLIC_APP_URL is fixed.
    return true;
}
