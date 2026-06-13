import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function getUserIdFromRequest(req: NextRequest): string | null {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        return decoded.id;
    } catch (err) {
        console.log("error",err);
        return null;
    }
}
