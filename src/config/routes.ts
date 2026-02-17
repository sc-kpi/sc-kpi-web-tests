export const Route = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  CLUBS: "/clubs",
  PROJECTS: "/projects",
  DEPARTMENTS: "/departments",
  DOCUMENTS: "/documents",
  PROFILE: "/profile",
  ADMIN: "/admin",
  ADMIN_FEATURE_FLAGS: "/admin/feature-flags",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_PREFERENCES: "/notifications/preferences",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_RATE_LIMITS: "/admin/rate-limits",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_2FA: "/verify-2fa",
  SECURITY: "/security",
} as const;

export type RoutePath = (typeof Route)[keyof typeof Route];
