import { getMarketplaceState } from "@/lib/mock-db";
import type { Role, User } from "@/lib/types";

export function getDemoUser(role: Role = "guardian") {
  const state = getMarketplaceState();
  return state.users.find((user) => user.role === role) ?? state.users[0];
}

export function getRequestUser(headers: Headers, fallbackRole: Role = "guardian"): User | undefined {
  const state = getMarketplaceState();
  const requestedUserId = headers.get("x-demo-user-id");
  const requestedRole = headers.get("x-demo-role") as Role | null;

  if (requestedUserId) {
    return state.users.find((user) => user.id === requestedUserId);
  }

  if (requestedRole) {
    return state.users.find((user) => user.role === requestedRole);
  }

  return getDemoUser(fallbackRole);
}
