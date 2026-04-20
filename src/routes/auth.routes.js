import { Router } from "express";
import {register, getMe, refreshToken} from "../controllers/auth.controller.js"
const authRouter = Router()

// /api/auth/register
authRouter.post('/register', register);
authRouter.get('/get-me', getMe)
authRouter.get('/refresh-token', refreshToken)

export default authRouter;