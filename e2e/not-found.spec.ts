import { test, expect } from "@playwright/test";

// This suite runs against `npm run dev` (see playwright.config.ts), so it
// exercises app/not-found.tsx directly, not the static `out/404.html` that
// GitHub Pages actually serves for an unknown path. `npm run build && ls
// out/404.html` confirms that file exists; it necessarily contains only the
// pre-hydration "Nothing here" shell (see NotFoundClient's getServerPath),
// so don't grep it for redirect copy — the behaviour these tests check only
// exists after client JS runs, same as it would on the live site.
test.describe("Custom 404", () => {
  test("old /career URL redirects to the career section", async ({ page }) => {
    await page.goto("/career");
    await expect(page.getByRole("heading", { name: /that page moved/i })).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/redirecting to career/i);
    await page.waitForURL(/\/#resume$/, { timeout: 10000 });
    await expect(page.locator("#resume")).toBeInViewport();
  });

  test("old /blog URL gets a plain 404 when there are no posts yet", async ({ page }) => {
    // There's no Writing section to rescue this to until a post ships
    // (see lib/content/writing.ts POSTS), so it must not redirect to a
    // dangling #writing anchor.
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: /nothing here/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Writing →" })).toHaveCount(0);
    await page.waitForTimeout(1500);
    expect(page.url()).toContain("/blog");
  });

  test("unknown paths get a plain 404 with no redirect", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await expect(page.getByRole("heading", { name: /nothing here/i })).toBeVisible();
    // No match means no timer is ever started, so a short wait is enough to
    // prove nothing fires — it isn't racing a real 3s countdown.
    await page.waitForTimeout(1500);
    expect(page.url()).toContain("/definitely-not-a-page");
  });

  test("clicking a section link cancels the pending auto-redirect", async ({ page }) => {
    await page.goto("/career");
    await page.getByRole("link", { name: "Projects →" }).click();
    await page.waitForURL(/\/#projects$/);
    // The /career -> /#resume timer would otherwise fire ~3s after load and
    // override the user's own navigation.
    await page.waitForTimeout(3500);
    await expect(page).toHaveURL(/\/#projects$/);
  });

  test("404 is branded, not the Next default", async ({ page }) => {
    await page.goto("/career");
    await expect(page.locator(".brutalist-root .brand-mark")).toBeVisible();
    await expect(page.getByText("This page could not be found.")).toHaveCount(0);
  });
});
