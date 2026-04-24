import userModel from "../models/user.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import otpModel from "../models/otp.model.js";
import { generateOtp, getOTPHtml } from "../utils/utils.js";

async function register(req, res) {
  const { username, email, password } = req.body;

  const isAlreadyRegistered = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isAlreadyRegistered) {
    return res.status(409).json({
      message: "Username or email already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });

  const otp = generateOtp();
  const html = getOTPHtml(otp);

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  await otpModel.create({
    email,
    user: user._id,
    otpHash,
  });

  await sendEmail(email, "OTP Verification", `Your OTP is ${otp}`, html);

  res.status(201).json({
    message: "User registered Successfully",
    user: {
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Email or Password is incorrect",
    });
  }

  if (!user.verified) {
    return res.status(400).json({
      message: "Please verify your email before logging in",
    });
  }

  const matchedPassword = await bcrypt.compare(password, user.password);

  if (!matchedPassword) {
    return res.status(400).json({
      message: "Email or Password is incorrect",
    });
  }

  const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.create({
    userId: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "User loggedin successfully",
    user: {
      username: user.username,
      email: user.email,
    },
    accessToken,
  });
}

async function getMe(req, res) {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token Not found",
    });
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await userModel.findById(decoded.id);

  res.status(200).json({
    message: "User fetched successfully",
    user: {
      username: user.username,
      email: user.email,
    },
  });
}

async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Unauthorized! Refresh Token Not Found",
    });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(401).json({
      message: "Invalid Refresh Token",
    });
  }

  const user = await userModel.findById(decoded.id);

  if (!user) {
    return res.status(401).json({
      message: "Invalid Refresh Token",
    });
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const newRefreshToken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Access token refreshed successfully",
    accessToken,
  });
}

async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Unauthorized! Refresh Token not found",
    });
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(400).json({
      message: "Invalid refresh Token",
    });
  }

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshToken");

  res.status(200).json({
    message: "Logged out successfully",
  });
}

async function logoutAll(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh Token Not found!",
    });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  await sessionModel.updateMany(
    { userId: decoded.id, revoked: false },
    { $set: { revoked: true } },
  );

  res.clearCookie("refreshToken");

  res.status(200).json({
    message: "User logged Out from All Devices.",
  });
}

async function verifyEmail(req, res) {
  const { otp, email } = req.body;

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const findOtp = await otpModel.findOne({ email, otpHash });

  if (!findOtp) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  const user = await userModel.findByIdAndUpdate(findOtp.user, {
    verified: true,
  });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  user.verified = true;
  await user.save();
  await otpModel.deleteMany({ user: findOtp.user });

  res.status(200).json({
    message: "Email verified successfully",
    user: {
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  });
}

export { register, getMe, refreshToken, logout, logoutAll, login, verifyEmail };
