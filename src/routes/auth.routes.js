import { Router } from "express";
import {
  register,
  getMe,
  refreshToken,
  logout,
  logoutAll,
  login,
  verifyEmail,
} from "../controllers/auth.controller.js";
const authRouter = Router();

// /api/auth/register
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/get-me", getMe);
authRouter.get("/refresh-token", refreshToken);
authRouter.get("/logout", logout);
authRouter.get("/logout-all", logoutAll);
authRouter.get("/verify-email", verifyEmail);

export default authRouter;
