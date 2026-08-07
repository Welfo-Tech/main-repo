import { AuthError, ForbiddenError } from "../lib/errors.js";
import { verifyPassword } from "../lib/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../lib/token.js";
import {
  findUserByEmail,
  findUserById,
  updateLastLoginAt,
} from "../repositories/user.repository.js";

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new AuthError("invalid credentials");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new AuthError("invalid credentials");

  if (!user.isActive) throw new ForbiddenError("account is inactive");

  await updateLastLoginAt(user.id);

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(user.id, user.role),
    signRefreshToken(user.id),
  ]);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function refresh(token: string) {
  const payload = await verifyToken(token).catch(() => {
    throw new AuthError("invalid refresh token");
  });

  if (payload["type"] !== "refresh") throw new AuthError("invalid token type");

  const user = await findUserById(payload.sub!);
  if (!user || !user.isActive) throw new AuthError("account not found or inactive");

  const accessToken = await signAccessToken(user.id, user.role);
  return { accessToken };
}

export async function getMe(userId: string) {
  const user = await findUserById(userId);
  if (!user) throw new AuthError("user not found");
  return user;
}
