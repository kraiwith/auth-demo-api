import express, { Express, Request, Response } from 'express';
import { PORT } from './secret';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorMiddleWare } from './middlewares/errors';

const app: Express = express();

app.use(express.json())

app.use('/api', rootRouter);

export const prismaClient = new PrismaClient({
    log: ['query']
});

app.use(errorMiddleWare);

app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
});
