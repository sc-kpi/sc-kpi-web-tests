import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { TestConfig } from "./config.types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// biome-ignore lint/suspicious/noExplicitAny: deep merge requires flexible typing
function deepMerge(base: any, override: any): any {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const overrideValue = override[key];
    if (
      overrideValue !== undefined &&
      typeof overrideValue === "object" &&
      overrideValue !== null &&
      !Array.isArray(overrideValue) &&
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], overrideValue);
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue;
    }
  }
  return result;
}

function resolveEnvPlaceholders(value: string): string {
  return value.replace(/\$\{(\w+)}/g, (_, envVar) => process.env[envVar] ?? "");
}

function resolveEnvInObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return resolveEnvPlaceholders(obj) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => resolveEnvInObject(item)) as T;
  }
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveEnvInObject(value);
    }
    return result as T;
  }
  return obj;
}

function loadYaml(filename: string): Partial<TestConfig> {
  const filePath = resolve(__dirname, filename);
  try {
    const content = readFileSync(filePath, "utf-8");
    return (parse(content) as Partial<TestConfig>) ?? {};
  } catch {
    return {};
  }
}

function applyEnvOverrides(config: TestConfig): TestConfig {
  const env = process.env;

  if (env.BASE_URL) config.baseUrl = env.BASE_URL;
  if (env.API_BASE_URL) config.apiBaseUrl = env.API_BASE_URL;
  if (env.TIMEOUT) config.timeout = Number(env.TIMEOUT);
  if (env.WORKERS) config.execution.workers = Number(env.WORKERS);
  if (env.PARALLEL) config.execution.parallel = env.PARALLEL === "true";
  if (env.AUTH_ENABLED) config.auth.enabled = env.AUTH_ENABLED === "true";
  if (env.HEADLESS) config.browser.headless = env.HEADLESS === "true";
  if (env.RETRIES) config.retry.maxAttempts = Number(env.RETRIES);
  if (env.LOCALE) config.browser.locale = env.LOCALE;
  if (env.MAILPIT_BASE_URL) config.mailpitBaseUrl = env.MAILPIT_BASE_URL;

  return config;
}

class ConfigurationManager {
  private static instance: ConfigurationManager | null = null;
  private config: TestConfig;

  private constructor() {
    const profile = process.env.TEST_ENV ?? "";

    const base = loadYaml("application.yml") as TestConfig;
    const profileConfig = profile ? loadYaml(`application-${profile}.yml`) : {};

    const merged = deepMerge(base, profileConfig) as TestConfig;
    const resolved = resolveEnvInObject(merged);
    this.config = applyEnvOverrides(resolved);
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  static reset(): void {
    ConfigurationManager.instance = null;
  }

  getConfig(): TestConfig {
    return this.config;
  }
}

export { ConfigurationManager };
