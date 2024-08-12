import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secret';
import { prismaClient } from '..';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // 1. check token
    const token = req.headers.authorization || '';
    // 2. token not found
    if (!token) {
        next(new UnauthorizedException('Unauthrized!', ErrorCode.UNAUTHORIZED));
    }

    try {
        // 3. token found verify extract payload
        const verified = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
        // 4. get user 
        const user = await prismaClient.user.findFirst({ where: { id: verified.userId } });
        if (!user) {
            next(new UnauthorizedException('Unauthrized!', ErrorCode.UNAUTHORIZED));
        }
        // 5. return current user
        req.user = user!;
    } catch (error) {
        next(new UnauthorizedException('Unauthrized!', ErrorCode.UNAUTHORIZED));
    }
}

export default authMiddleware;
