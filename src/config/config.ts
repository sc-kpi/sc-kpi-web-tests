import type { AuthConfig, BrowserConfig, ExecutionConfig, RetryConfig } from "./config.types.js";
import { ConfigurationManager } from "./configuration-manager.js";

export class Config {
  static baseUrl(): string {
    return ConfigurationManager.getInstance().getConfig().baseUrl;
  }

  static apiBaseUrl(): string {
    return ConfigurationManager.getInstance().getConfig().apiBaseUrl;
  }

  static timeout(): number {
    return ConfigurationManager.getInstance().getConfig().timeout;
  }

  static execution(): ExecutionConfig {
    return ConfigurationManager.getInstance().getConfig().execution;
  }

  static isAuthEnabled(): boolean {
    return ConfigurationManager.getInstance().getConfig().auth.enabled;
  }

  static auth(): AuthConfig {
    return ConfigurationManager.getInstance().getConfig().auth;
  }

  static retry(): RetryConfig {
    return ConfigurationManager.getInstance().getConfig().retry;
  }

  static browser(): BrowserConfig {
    return ConfigurationManager.getInstance().getConfig().browser;
  }

  static mailpitBaseUrl(): string {
    return ConfigurationManager.getInstance().getConfig().mailpitBaseUrl;
  }
}
