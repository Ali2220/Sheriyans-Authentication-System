import { Router } from "express";
import {
  register,
  getMe,
  refreshToken,
  logout,
  logoutAll,
  login,
} from "../controllers/auth.controller.js";
const authRouter = Router();

// /api/auth/register
authRouter.post("/register", register);
authRouter.get("/login", login);
authRouter.get("/get-me", getMe);
authRouter.get("/refresh-token", refreshToken);
authRouter.get("/logout", logout);
authRouter.get("/logout-all", logoutAll);

export default authRouter;
