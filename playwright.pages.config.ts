import { defineConfig } from "@playwright/test";
import config from "./playwright.config";
export default defineConfig({
  ...config,
  testDir: "./e2e-pages",
  use: {
    ...config.use,
    baseURL: "http://127.0.0.1:4173/colloquium-calculus-2module-hseami/",
  },
  webServer: {
    command: "GITHUB_PAGES=true npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173/colloquium-calculus-2module-hseami/",
    reuseExistingServer: false,
  },
});
