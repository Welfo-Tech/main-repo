import { SignJWT, jwtVerify } from "jose";
import { config } from "../config.js";

const secret = new TextEncoder().encode(config.JWT_SECRET);

export async function signAccessToken(
  userId: string,
  role: string,
): Promise<string> {
  return new SignJWT({ role, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(config.JWT_ACCESS_EXPIRY)
    .sign(secret);
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(config.JWT_REFRESH_EXPIRY)
    .sign(secret);
}

export async function signPortalAccessToken(
  contactId: string,
  orgId: string,
): Promise<string> {
  return new SignJWT({ orgId, type: "portal_access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(contactId)
    .setIssuedAt()
    .setExpirationTime(config.JWT_ACCESS_EXPIRY)
    .sign(secret);
}

export async function signPortalRefreshToken(
  contactId: string,
): Promise<string> {
  return new SignJWT({ type: "portal_refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(contactId)
    .setIssuedAt()
    .setExpirationTime(config.JWT_REFRESH_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
