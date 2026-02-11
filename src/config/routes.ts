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
} as const;

export type RoutePath = (typeof Route)[keyof typeof Route];
