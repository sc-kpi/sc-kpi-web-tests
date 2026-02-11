import { expect, test } from "@playwright/test";
import { Config } from "../../src/config/config.js";
import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";

test.describe("Configuration", { tag: [Tag.FRAMEWORK] }, () => {
  test("should load configuration successfully", () => {
    const baseUrl = Config.baseUrl();
    expect(baseUrl).toBeTruthy();
    expect(typeof baseUrl).toBe("string");
  });

  test("should have valid baseUrl format", () => {
    const baseUrl = Config.baseUrl();
    expect(baseUrl).toMatch(/^https?:\/\/.+/);
  });

  test("should have auth configuration accessible", () => {
    const auth = Config.auth();
    expect(auth).toBeDefined();
    expect(typeof auth.enabled).toBe("boolean");
    expect(auth.loginEndpoint).toBeTruthy();
  });

  test("should have execution configuration", () => {
    const execution = Config.execution();
    expect(execution).toBeDefined();
    expect(typeof execution.parallel).toBe("boolean");
    expect(execution.workers).toBeGreaterThan(0);
  });

  test("should have browser configuration", () => {
    const browser = Config.browser();
    expect(browser).toBeDefined();
    expect(browser.locale).toBeTruthy();
    expect(typeof browser.headless).toBe("boolean");
  });

  test("should have route constants defined", () => {
    expect(Route.HOME).toBe("/");
    expect(Route.LOGIN).toBe("/login");
    expect(Route.REGISTER).toBe("/register");
  });

  test("should have timeout configuration", () => {
    const timeout = Config.timeout();
    expect(timeout).toBeGreaterThan(0);
  });
});
