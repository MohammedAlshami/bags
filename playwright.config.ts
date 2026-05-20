import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npx next dev -p 3001",
    url: "http://localhost:3001",
    cwd: ".",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
