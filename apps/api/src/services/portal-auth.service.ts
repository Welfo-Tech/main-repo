import { AuthError, ForbiddenError } from "../lib/errors.js";
import { verifyPassword } from "../lib/password.js";
import {
  signPortalAccessToken,
  signPortalRefreshToken,
  verifyToken,
} from "../lib/token.js";
import {
  findContactByEmail,
  findContactById,
} from "../repositories/contact.repository.js";

export async function portalLogin(email: string, password: string) {
  const contact = await findContactByEmail(email);
  if (!contact || !contact.passwordHash)
    throw new AuthError("invalid credentials");

  const valid = await verifyPassword(password, contact.passwordHash);
  if (!valid) throw new AuthError("invalid credentials");

  if (!contact.isActive) throw new ForbiddenError("account is inactive");

  const [accessToken, refreshToken] = await Promise.all([
    signPortalAccessToken(contact.id, contact.organizationId),
    signPortalRefreshToken(contact.id),
  ]);

  return {
    accessToken,
    refreshToken,
    contact: {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      organizationId: contact.organizationId,
      organizationName: contact.organization.name,
    },
  };
}

export async function portalRefresh(token: string) {
  const payload = await verifyToken(token).catch(() => {
    throw new AuthError("invalid refresh token");
  });

  if (payload["type"] !== "portal_refresh")
    throw new AuthError("invalid token type");

  const contact = await findContactById(payload.sub!);
  if (!contact || !contact.isActive)
    throw new AuthError("account not found or inactive");

  const accessToken = await signPortalAccessToken(
    contact.id,
    contact.organizationId,
  );
  return { accessToken };
}

export async function getPortalMe(contactId: string) {
  const contact = await findContactById(contactId);
  if (!contact) throw new AuthError("contact not found");
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    organizationId: contact.organizationId,
    organizationName: contact.organization.name,
  };
}
