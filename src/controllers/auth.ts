import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '..';
import { hashSync, compareSync } from 'bcrypt';
import { JWT_SECRET, SALT } from '../secret';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { BadRequestException } from '../exceptions/bad-request';
import { ErrorCode } from '../exceptions/root';
import { UnprocessableEntity } from '../exceptions/validation';
import { SignUpSchema } from '../schemas/users';
import { NotFoundException } from '../exceptions/not-found';

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    SignUpSchema.parse(req.body);

    const { email, password, name } = req.body;

    let user = await prismaClient.user.findFirst({ where: { email } });
    if (user) {
        next(new BadRequestException('User already exists!', ErrorCode.USER_ALREADY_EXISTS));
    }

    user = await prismaClient.user.create({
        data: {
            name, email, password: hashSync(password, Number(SALT!)),
        }
    });

    const newUser: Partial<User> = {
        id: user.id,
        email: user.email,
        name: user.name,
        createAt: user.createAt,
        updateAt: user.updateAt,
    };

    res.json({ user: newUser });
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        let user = await prismaClient.user.findFirst({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found!', ErrorCode.USER_NOT_FOUND);
        }

        if (!compareSync(password, user.password)) {
            throw new BadRequestException('Incorrect password!', ErrorCode.INCORRECT_PASSWORD);
        }

        const token = jwt.sign({
            userId: user.id,
        }, JWT_SECRET!);

        const newUser: Partial<User> = {
            id: user.id,
            email: user.email,
            name: user.name,
            createAt: user.createAt,
            updateAt: user.updateAt,
        };

        res.json({
            user: newUser,
            token
        });
    } catch (error: any) {
        next(new UnprocessableEntity(error?.issues, 'Unprocessable Entity!', ErrorCode.UNPROCESSABLE_ENTITY));
    }
}

export const me = async (req: Request, res: Response) => {
    console.log(`✨ ~ req.user:`, req.user);
    const newUser: Partial<User> = {
        id: req.user?.id,
        email: req.user?.email,
        name: req.user?.name,
        createAt: req.user?.createAt,
        updateAt: req.user?.updateAt,
    };

    res.json(newUser);
}
