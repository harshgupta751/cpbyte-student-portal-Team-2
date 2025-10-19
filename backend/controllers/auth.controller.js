import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { generateRefreshToken, hashToken, REFRESH_TOKEN_DAYS, generateAccessToken } from "../utils/authTokens.js";
import prisma from "../config/db.js";
import ResponseError from "../types/ResponseError.js";

config();

export const login = asyncHandler(async (req, res) => {
  const { library_id, password } = req.body;

  const user = await prisma.user.findUnique({ where: { library_id } });
  if (!user) throw new ResponseError("User does not exist", 401);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new ResponseError("Invalid credentials", 401);

  const token = generateAccessToken(user);

  const rawRefresh = generateRefreshToken();
  const tokenHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      createdByIp: req.ip,
      userAgent: req.get('User-Agent') || null
    }
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", rawRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: "/api/v1/auth",
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  });


  res.json({ success: true, message: "Login successfull", data: token, refreshToken: rawRefresh });
});


export const refresh = asyncHandler(async (req, res) => {

  // Transactional rotation -> create new token, mark old revoked and link
  try {
    // console.log(req);
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
    console.log(rawToken);
    if (!rawToken) return res.status(401).json({ error: 'No refresh token' });
    const tHash = hashToken(rawToken);

    console.log("Incoming refresh token:", rawToken);
    console.log("Token hash:", tHash);


    const result = await prisma.$transaction(async (tx) => {
      // find token
      const existing = await tx.refreshToken.findUnique({
        where: { tokenHash: tHash },
      });

      if (!existing) {

        return { ok: false, reason: 'invalid' };
      }

      if (existing.revoked || existing.expiresAt < new Date()) {
        // Token expired or already revoked -> possible reuse attack -> revoke all user's tokens
        await tx.refreshToken.updateMany({
          where: { userId: existing.userId, revoked: false },
          data: { revoked: true, revokedAt: new Date() }
        });
        return { ok: false, reason: 'revoked' };
      }


      const newRaw = generateRefreshToken();
      const newHash = hashToken(newRaw);
      const newExpiry = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
      const created = await tx.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: newHash,
          expiresAt: newExpiry,
          createdByIp: req.ip,
          userAgent: req.get('User-Agent') || null
        }
      });

      await tx.refreshToken.update({
        where: { id: existing.id },
        data: { revoked: true, revokedAt: new Date(), replacedById: created.id }
      });

      const user = await tx.user.findUnique({ where: { id: existing.userId } });
      const newAccess = generateAccessToken(user);
      return { ok: true, newRaw, newAccess, userId: user.id };
    },
      {
        timeout: 10000,
        maxWait: 5000,
      }
    );

    if (!result.ok) {
      return res.status(401).json({ error: 'Refresh failed', reason: result.reason });
    }


    res.cookie('refreshToken', result.newRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: "/api/v1/auth",
      maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    });
console.log("Sent new refresh token cookie:", result.newRaw);

    return res.json({ accessToken: result.newAccess });
  } catch (err) {
    console.error('refresh error', err);
    return res.status(500).json({ error: 'server error' });
  }
});




export const register = asyncHandler(async (req, res) => {
  const { name, library_id, email, role, domain_dev, domain_dsa, year } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { library_id } });
  if (existingUser) throw new ResponseError("User already exists", 400);

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new ResponseError("Email already registered", 400);
  const generateRandomPassword = (length = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  const randomPassword = "password123"
  // generateRandomPassword();
  // console.log(randomPassword)
  const hashedPassword = bcrypt.hashSync(randomPassword, 10);

  const user = await prisma.user.create({
    data: {
      name,
      library_id,
      email,
      role,
      year,
      domain_dev,
      domain_dsa,
      password: hashedPassword,
    },
  });

  // @todo! Mail the generated password to the user through their email

  const tracker = await prisma.trackerDashboard.create({
    data: {
      userId: user.id,
      skills: [],
      github: {
        create: {
          url: "",
          username: ""
        },
      },
      leetcode: {
        create: {
          url: "",
          username: ""
        },
      },
    },
  })

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (rawToken) {
    const tHash = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: tHash, revoked: false },
      data: { revoked: true, revokedAt: new Date() }
    });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
  });

  res.status(200).json({ success: true, message: "Logout successful" });
});
