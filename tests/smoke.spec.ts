import { test, expect } from "@playwright/test";

test.describe("Friday Pool Party", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("homepage loads", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Friday Pool Party");
  });

  test("can navigate to members page", async ({ page }) => {
    await page.click("text=Members");
    await expect(page).toHaveURL(/.*\/members/);
    await expect(page.locator("h1")).toContainText("Member Directory");
  });

  test("can navigate to sign in", async ({ page }) => {
    await page.click("text=Sign In");
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    await expect(page.locator("h1")).toContainText("Sign In");
  });

  test("member search works", async ({ page }) => {
    await page.goto("http://localhost:3000/members");
    await page.fill('input[type="text"]', "alice");
    await page.click('button:has-text("Search")');
    // Wait for results
    await page.waitForTimeout(500);
    // Should show search results (if seeded)
  });
});

test.describe("Admin features", () => {
  test("admin dashboard requires auth", async ({ page }) => {
    await page.goto("http://localhost:3000/admin");
    // Should redirect to home or sign in
    await expect(page).not.toHaveURL(/.*\/admin/);
  });
});
