import { Router } from 'express';
import { register, login, refresh } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginSchema, refreshSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);

export default router;
