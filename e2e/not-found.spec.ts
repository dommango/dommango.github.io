import { test, expect } from "@playwright/test";

test.describe("Custom 404", () => {
  test("old /career URL redirects to the career section", async ({ page }) => {
    await page.goto("/career");
    await expect(page.getByRole("heading", { name: /that page moved/i })).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/taking you there/i);
    await page.waitForURL(/\/#resume$/, { timeout: 6000 });
  });

  test("unknown paths get a plain 404 with no redirect", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await expect(page.getByRole("heading", { name: /nothing here/i })).toBeVisible();
    await page.waitForTimeout(4000);
    expect(page.url()).toContain("/definitely-not-a-page");
  });

  test("404 is branded, not the Next default", async ({ page }) => {
    await page.goto("/career");
    await expect(page.locator(".brutalist-root .brand-mark")).toBeVisible();
    await expect(page.getByText("This page could not be found.")).toHaveCount(0);
  });
});
