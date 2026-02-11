export const Tag = {
  SMOKE: "@smoke",
  REGRESSION: "@regression",
  SECURITY: "@security",
  FRAMEWORK: "@framework",
  POSITIVE: "@positive",
  NEGATIVE: "@negative",
} as const;

export type TestTag = (typeof Tag)[keyof typeof Tag];
