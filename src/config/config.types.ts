export interface TierCredentials {
  email: string;
  password: string;
}

export interface AuthConfig {
  enabled: boolean;
  loginEndpoint: string;
  tierCredentials: Record<string, TierCredentials>;
}

export interface ExecutionConfig {
  parallel: boolean;
  workers: number;
}

export interface RetryConfig {
  maxAttempts: number;
}

export interface BrowserConfig {
  locale: string;
  headless: boolean;
}

export interface TestConfig {
  baseUrl: string;
  apiBaseUrl: string;
  timeout: number;
  execution: ExecutionConfig;
  auth: AuthConfig;
  retry: RetryConfig;
  browser: BrowserConfig;
  mailpitBaseUrl: string;
}
