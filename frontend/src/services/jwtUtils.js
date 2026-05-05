function base64UrlToBase64(input) {
  // JWT payload is base64url without padding.
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  return base64 + "=".repeat(padLength);
}

export function decodeToken(token) {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payloadJson = atob(base64UrlToBase64(parts[1]));
    return JSON.parse(payloadJson);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

export function getRoleFromDecodedToken(decoded) {
  if (!decoded || typeof decoded !== "object") return null;

  // ASP.NET ClaimTypes.Role serializes as this URI by default.
  const roleClaimUri = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
  const roleValue =
    decoded.role ??
    decoded.roles ??
    decoded[roleClaimUri] ??
    null;

  if (Array.isArray(roleValue)) return roleValue[0] ?? null;
  if (typeof roleValue === "string") return roleValue;
  return null;
}

export function getUsernameFromDecodedToken(decoded) {
  if (!decoded || typeof decoded !== "object") return null;

  // ASP.NET ClaimTypes.Name serializes as this URI by default.
  const nameClaimUri = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
  const username =
    decoded.username ??
    decoded[nameClaimUri] ??
    decoded.unique_name ??
    decoded.name ??
    decoded.sub ??
    null;

  return typeof username === "string" ? username : null;
}

export function getUserInfo() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  return decodeToken(token);
}
