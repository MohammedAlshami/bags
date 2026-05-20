import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "admin";
const BASE_URL = "http://localhost:3001";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill("#login-identifier", ADMIN_EMAIL);
  await page.fill("#login-password", ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin");
}

const ts = Date.now();
const TEST_ID = `pw-test-${ts}`;
const TEST_NAME = `متجر اختبار ${ts}`;
const TEST_CITY = "صنعاء";
const TEST_ADDRESS = "شارع الاختبار";
const TEST_PHONE = "777777777";
const TEST_LAT_STORE = "15.3694";
const TEST_LON_STORE = "44.191";

const EDITED_NAME = `متجر معدل ${ts}`;

test.describe("Store locations CRUD", () => {
  test("full flow: create, verify on frontend, edit, delete", async ({ page }) => {
    // ── Login ──
    await loginAsAdmin(page);

    // ── Go to store locations admin ──
    await page.goto(`${BASE_URL}/admin/store-locations`);
    await expect(page.getByRole("heading", { name: "نقاط البيع" })).toBeVisible();

    // ── Create a new store location ──
    await page.getByRole("button", { name: "إضافة نقطة بيع" }).click();
    await expect(page.getByRole("heading", { name: "نقطة بيع جديدة" })).toBeVisible();

    // Fill form fields using parent-label pattern
    const labels = page.locator("label");
    await labels.filter({ hasText: "المعرف (ID)" }).locator("..").locator("input").fill(TEST_ID);
    await labels.filter({ hasText: "الاسم" }).locator("..").locator("input").fill(TEST_NAME);
    await labels.filter({ hasText: "المدينة" }).locator("..").locator("input").fill(TEST_CITY);
    await labels.filter({ hasText: "العنوان" }).locator("..").locator("textarea").fill(TEST_ADDRESS);
    await labels.filter({ hasText: "رقم الهاتف" }).locator("..").locator("input").fill(TEST_PHONE);
    await labels.filter({ hasText: "خط العرض" }).locator("..").locator("input").fill(TEST_LAT_STORE);
    await labels.filter({ hasText: "خط الطول" }).locator("..").locator("input").fill(TEST_LON_STORE);

    await page.getByRole("button", { name: "حفظ" }).click();

    // Wait for save and list refresh
    await expect(page.getByText(TEST_ID)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(TEST_NAME)).toBeVisible();

    // ── Check landing page ──
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('section[aria-label="نقاط البيع"]');
    const dropdown = page.locator("#store-location-combobox");
    await dropdown.click();
    await expect(page.getByText(TEST_NAME)).toBeVisible({ timeout: 10000 });

    // ── Check locations page ──
    await page.goto(`${BASE_URL}/locations`);
    await page.waitForSelector("h1");
    await expect(page.getByText(TEST_NAME)).toBeVisible({ timeout: 10000 });

    // ── Edit the store location ──
    await page.goto(`${BASE_URL}/admin/store-locations`);
    await page.waitForSelector(`text=${TEST_ID}`);

    // Click edit button in the row containing our test ID
    const row = page.getByRole("row").filter({ hasText: TEST_ID });
    await row.getByRole("button", { name: "تعديل" }).click();
    await expect(page.getByRole("heading", { name: "تعديل نقطة البيع" })).toBeVisible();

    // Clear and fill name
    const nameInput = page.locator("label").filter({ hasText: "الاسم" }).locator("..").locator("input");
    await nameInput.clear();
    await nameInput.fill(EDITED_NAME);
    await page.getByRole("button", { name: "حفظ" }).click();

    // Wait for save and verify edit
    await expect(page.getByText(EDITED_NAME)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(TEST_NAME)).not.toBeVisible();

    // ── Delete the store location ──
    await page.goto(`${BASE_URL}/admin/store-locations`);
    await page.waitForSelector(`text=${TEST_ID}`);

    const rowForDelete = page.getByRole("row").filter({ hasText: TEST_ID });
    await rowForDelete.getByRole("button", { name: "حذف" }).click();

    await expect(page.getByRole("heading", { name: "حذف نقطة البيع" })).toBeVisible();
    await page.getByRole("button", { name: "حذف" }).last().click();

    // Wait for delete and verify
    await expect(page.getByText(TEST_ID)).not.toBeVisible({ timeout: 10000 });

    // ── Verify deletion on frontend pages ──
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('section[aria-label="نقاط البيع"]');
    const dropdownAfter = page.locator("#store-location-combobox");
    await dropdownAfter.click();
    await expect(page.getByText(EDITED_NAME)).not.toBeVisible({ timeout: 5000 });

    await page.goto(`${BASE_URL}/locations`);
    await page.waitForSelector("h1");
    await expect(page.getByText(EDITED_NAME)).not.toBeVisible({ timeout: 5000 });
  });
});
