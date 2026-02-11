import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const AUTH_DIR = resolve(import.meta.dirname, "../../playwright/.auth");
mkdirSync(AUTH_DIR, { recursive: true });

export const BASIC_STORAGE_STATE = resolve(AUTH_DIR, "basic.json");
export const ADMIN_STORAGE_STATE = resolve(AUTH_DIR, "admin.json");
