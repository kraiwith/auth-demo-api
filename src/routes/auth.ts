import { Router } from 'express';
import { login, me, signUp } from '../controllers/auth';
import { errorHandler } from '../error-handler';
import authMiddleware from '../middlewares/auth';

const authRoutes: Router = Router();

authRoutes.post('/sign-up', errorHandler(signUp));

authRoutes.post('/login', errorHandler(login));

authRoutes.get('/me', [authMiddleware], errorHandler(me));

export default authRoutes;
