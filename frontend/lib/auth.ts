import { jwtVerify, SignJWT } from "jose";
import { nanoid } from "nanoid";

// JWT密钥（从环境变量获取，生产环境必须设置）
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_for_development"
);

// Token过期时间（24小时）
const TOKEN_EXPIRATION = 60 * 60 * 24;

/**
 * 创建JWT访问令牌
 * @param userId 用户ID
 * @returns JWT令牌
 */
export async function createAccessToken(userId: string): Promise<string> {
  try {
    const token = await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION)
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error("创建访问令牌失败:", error);
    throw new Error("无法创建访问令牌");
  }
}

/**
 * 验证JWT访问令牌
 * @param token JWT令牌
 * @returns 验证结果
 */
export async function verifyAccessToken(token: string): Promise<{ userId: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string };
  } catch (error) {
    console.error("验证访问令牌失败:", error);
    return null;
  }
}

/**
 * 获取Cookie选项
 * @returns Cookie选项配置
 */
export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_EXPIRATION,
    path: "/",
    sameSite: "strict" as const,
  };
}