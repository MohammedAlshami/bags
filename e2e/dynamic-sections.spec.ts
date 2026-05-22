import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "mansorreham5@gmail.com";
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

test.describe("Before & After images CRUD", () => {
  test("full flow: create, verify on frontend, edit, delete", async ({ page }) => {
    await loginAsAdmin(page);

    const TEST_IMAGE_URL = "/images/before-after/WhatsApp Image 2026-05-16 at 10.34.42 PM.jpeg";
    const TEST_SORT = `${ts}`;
    const EDITED_SORT = `${ts + 1}`;

    // ── Go to before-after admin ──
    await page.goto(`${BASE_URL}/admin/before-after`);
    await expect(page.getByRole("heading", { name: "صور قبل وبعد" })).toBeVisible();

    // ── Create ──
    await page.getByRole("button", { name: "إضافة صورة" }).click();
    await expect(page.getByRole("heading", { name: "صورة جديدة" })).toBeVisible();

    const labels = page.locator("label");
    await labels.filter({ hasText: "رابط الصورة" }).locator("..").locator("input").fill(TEST_IMAGE_URL);
    await labels.filter({ hasText: "ترتيب العرض" }).locator("..").locator("input").fill(TEST_SORT);

    await page.getByRole("button", { name: "حفظ" }).click();
    await expect(page.getByRole("cell", { name: TEST_SORT })).toBeVisible({ timeout: 10000 });

    // ── Verify on frontend ──
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('section[aria-labelledby="before-after-heading"]')).toBeVisible({ timeout: 10000 });

    // ── Edit ──
    await page.goto(`${BASE_URL}/admin/before-after`);
    const row = page.getByRole("row").filter({ hasText: TEST_SORT });
    await row.getByRole("button", { name: "تعديل" }).click();
    await expect(page.getByRole("heading", { name: "تعديل الصورة" })).toBeVisible();

    const sortInput = page.locator("label").filter({ hasText: "ترتيب العرض" }).locator("..").locator("input");
    await sortInput.clear();
    await sortInput.fill(EDITED_SORT);
    await page.getByRole("button", { name: "حفظ" }).click();
    await expect(page.getByText(EDITED_SORT)).toBeVisible({ timeout: 10000 });

    // ── Delete ──
    await page.goto(`${BASE_URL}/admin/before-after`);
    const delRow = page.getByRole("row").filter({ hasText: EDITED_SORT });
    await delRow.getByRole("button", { name: "حذف" }).click();
    await expect(page.getByRole("heading", { name: "حذف الصورة" })).toBeVisible();
    await page.getByRole("button", { name: "حذف" }).last().click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.getByRole("cell", { name: EDITED_SORT })).not.toBeVisible({ timeout: 10000 });
  });
});

test.describe("Reviews CRUD", () => {
  test("full flow: create, verify on frontend, edit, delete", async ({ page }) => {
    await loginAsAdmin(page);

    const TEST_AUTHOR = `عميل اختبار ${ts}`;
    const TEST_BODY = `هذا تقييم اختباري تم إنشاؤه في ${ts}`;
    const EDITED_BODY = `تم تعديل هذا التقييم ${ts}`;

    // ── Go to reviews admin ──
    await page.goto(`${BASE_URL}/admin/reviews`);
    await expect(page.getByRole("heading", { name: "تقييمات العملاء" })).toBeVisible();

    // ── Create ──
    await page.getByRole("button", { name: "إضافة تقييم" }).click();
    await expect(page.getByRole("heading", { name: "تقييم جديد" })).toBeVisible();

    const labels = page.locator("label");
    await labels.filter({ hasText: "اسم العميل" }).locator("..").locator("input").fill(TEST_AUTHOR);
    await labels.filter({ hasText: "نص التقييم" }).locator("..").locator("textarea").fill(TEST_BODY);
    await labels.filter({ hasText: "ترتيب العرض" }).locator("..").locator("input").fill("99");

    await page.getByRole("button", { name: "حفظ" }).click();
    await expect(page.getByText(TEST_AUTHOR)).toBeVisible({ timeout: 10000 });

    // ── Verify on frontend ──
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('section[aria-labelledby="home-reviews-heading"]')).toBeVisible({ timeout: 10000 });

    // ── Edit ──
    await page.goto(`${BASE_URL}/admin/reviews`);
    const row = page.getByRole("row").filter({ hasText: TEST_AUTHOR });
    await row.getByRole("button", { name: "تعديل" }).click();
    await expect(page.getByRole("heading", { name: "تعديل التقييم" })).toBeVisible();

    const bodyInput = page.locator("label").filter({ hasText: "نص التقييم" }).locator("..").locator("textarea");
    await bodyInput.clear();
    await bodyInput.fill(EDITED_BODY);
    await page.getByRole("button", { name: "حفظ" }).click();
    await expect(page.getByText(EDITED_BODY)).toBeVisible({ timeout: 10000 });

    // ── Delete ──
    await page.goto(`${BASE_URL}/admin/reviews`);
    const delRow = page.getByRole("row").filter({ hasText: TEST_AUTHOR });
    await delRow.getByRole("button", { name: "حذف" }).click();
    await expect(page.getByRole("heading", { name: "حذف التقييم" })).toBeVisible();
    await page.getByRole("button", { name: "حذف" }).last().click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.getByRole("cell", { name: TEST_AUTHOR })).not.toBeVisible({ timeout: 10000 });
  });
});

test.describe("FAQ items CRUD", () => {
  test("full flow: create, verify on frontend, edit, delete", async ({ page }) => {
    await loginAsAdmin(page);

    const TEST_QUESTION = `سؤال اختبار ${ts}`;
    const TEST_ANSWER = `إجابة اختبار تم إنشاؤها في ${ts}`;
    const EDITED_ANSWER = `تم تعديل الإجابة ${ts}`;

    // ── Go to FAQ admin ──
    await page.goto(`${BASE_URL}/admin/faq-items`);
    await expect(page.getByRole("heading", { name: "الأسئلة الشائعة" })).toBeVisible();

    // ── Create ──
    await page.getByRole("button", { name: "إضافة سؤال" }).click();
    await expect(page.getByRole("heading", { name: "سؤال جديد" })).toBeVisible();

    const labels = page.locator("label");
    await labels.filter({ hasText: "السؤال" }).locator("..").locator("input").fill(TEST_QUESTION);
    await labels.filter({ hasText: "الإجابة" }).locator("..").locator("textarea").fill(TEST_ANSWER);
    await labels.filter({ hasText: "ترتيب العرض" }).locator("..").locator("input").fill("99");

    await page.getByRole("button", { name: "حفظ" }).click();
    await expect(page.getByText(TEST_QUESTION)).toBeVisible({ timeout: 10000 });

    // ── Verify on frontend ──
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('section[aria-labelledby="home-faq-heading"]')).toBeVisible({ timeout: 10000 });

    // ── Edit ──
    await page.goto(`${BASE_URL}/admin/faq-items`);
    const row = page.getByRole("row").filter({ hasText: TEST_QUESTION });
    await row.getByRole("button", { name: "تعديل" }).click();
    await expect(page.getByRole("heading", { name: "تعديل السؤال" })).toBeVisible();

    const answerInput = page.locator("label").filter({ hasText: "الإجابة" }).locator("..").locator("textarea");
    await answerInput.clear();
    await answerInput.fill(EDITED_ANSWER);
    await page.getByRole("button", { name: "حفظ" }).click();
    await expect(page.getByText(EDITED_ANSWER)).toBeVisible({ timeout: 10000 });

    // ── Delete ──
    await page.goto(`${BASE_URL}/admin/faq-items`);
    const delRow = page.getByRole("row").filter({ hasText: TEST_QUESTION });
    await delRow.getByRole("button", { name: "حذف" }).click();
    await expect(page.getByRole("heading", { name: "حذف السؤال" })).toBeVisible();
    await page.getByRole("button", { name: "حذف" }).last().click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.getByRole("cell", { name: TEST_QUESTION })).not.toBeVisible({ timeout: 10000 });
  });
});
