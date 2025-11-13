export function isAdminUser(user) {
  if (!user) return false;

  // Collect roles from multiple possible shapes on the user object
  let roles;

  // 1) If user has an 'accounts' array (AccountDto) with a 'role' field
  if (Array.isArray(user.accounts)) {
    roles = user.accounts
      .map((acc) => (acc && acc.role ? String(acc.role).toUpperCase() : null))
      .filter(Boolean);
  }

  // 2) Authorities array (e.g., [{ authority: 'ROLE_ADMIN' }])
  if ((!roles || roles.length === 0) && Array.isArray(user.authorities)) {
    roles = user.authorities
      .map((a) =>
        a && a.authority
          ? String(a.authority).toUpperCase()
          : String(a).toUpperCase(),
      )
      .filter(Boolean);
  }

  // 3) roles / role / authority fields
  if (!roles || roles.length === 0) {
    if (user.roles) {
      roles = Array.isArray(user.roles)
        ? user.roles.map((r) => String(r).toUpperCase())
        : [String(user.roles).toUpperCase()];
    } else if (user.role) {
      roles = Array.isArray(user.role)
        ? user.role.map((r) => String(r).toUpperCase())
        : [String(user.role).toUpperCase()];
    } else if (user.authority) {
      roles = [String(user.authority).toUpperCase()];
    }
  }

  // Fallback: try to normalize a mixed 'role' variable
  if (
    (!roles || roles.length === 0) &&
    (user.role || user.authority || user.authorities)
  ) {
    const maybe = user.role || user.authority || user.authorities;
    if (Array.isArray(maybe)) roles = maybe.map((r) => String(r).toUpperCase());
    else if (typeof maybe === "string") roles = [maybe.toUpperCase()];
  }

  roles = roles || [];

  // Normalize prefixes: accept ROLE_ADMIN or ADMIN
  const normalizedRoles = roles.map((r) =>
    r.startsWith("ROLE_") ? r.substring(5) : r,
  );

  return normalizedRoles.includes("ADMIN");
}
