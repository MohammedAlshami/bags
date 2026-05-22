import { test, expect } from "@playwright/test";

test("superadmin login flow", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("https://goldqueen.store/login");
  await page.waitForSelector("#login-identifier", { timeout: 10000 });

  await page.fill("#login-identifier", "mansorreham5@gmail.com");
  await page.fill("#login-password", "admin");
  await page.click("button[type=submit]");

  // Wait up to 5 seconds and capture every URL we go through
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(500);
    console.log(`  t=${(i + 1) * 0.5}s  url=${page.url()}`);
  }

  console.log("Errors:", errors);
  await page.screenshot({ path: "debug-final.png", fullPage: true });

  expect(page.url()).toBe("https://goldqueen.store/admin");
});
