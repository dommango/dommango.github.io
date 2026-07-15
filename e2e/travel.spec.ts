import { test, expect } from "@playwright/test";

test.describe("Travel map", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // "My Travel Map" was pre-brutalist copy and no longer exists, so this
    // hook failed on every test. Scroll to the section itself instead.
    await page.locator("#travel").scrollIntoViewIfNeeded();
  });

  test("renders the travel map globe", async ({ page }) => {
    const mapContainer = page.locator('[style*="cursor"]').first();
    await expect(mapContainer.locator("svg")).toBeVisible({ timeout: 10000 });
  });

  test("shows country and continent count", async ({ page }) => {
    await expect(
      page.getByText(/countries across \d+ continents/i),
    ).toBeVisible();
  });

  test("map shades visited countries in gold", async ({ page }) => {
    await expect(async () => {
      const visitedCount = await page.evaluate(() => {
        const paths = document.querySelectorAll("svg path");
        return Array.from(paths).filter(
          (p) => (p as SVGPathElement).getAttribute("fill") === "#b8922f",
        ).length;
      });
      expect(visitedCount).toBeGreaterThan(10);
    }).toPass({ timeout: 15000 });
  });

  test("flight routes are visible by default", async ({ page }) => {
    // showFlights defaults to true — rsm-line paths should be rendered
    await expect(async () => {
      const lineCount = await page.evaluate(
        () => document.querySelectorAll("path.rsm-line").length,
      );
      expect(lineCount).toBeGreaterThan(0);
    }).toPass({ timeout: 10000 });
  });

  test("flight toggle hides and shows routes", async ({ page }) => {
    // Wait for routes to be visible first
    await page.waitForFunction(
      () => document.querySelectorAll("path.rsm-line").length > 0,
      { timeout: 10000 },
    );

    const toggle = page.getByRole("button", { name: /flight/i });
    await expect(toggle).toBeVisible();

    // Click to hide
    await toggle.click();
    await expect(async () => {
      const count = await page.evaluate(
        () => document.querySelectorAll("path.rsm-line").length,
      );
      expect(count).toBe(0);
    }).toPass({ timeout: 5000 });

    // Click to show again
    await toggle.click();
    await expect(async () => {
      const count = await page.evaluate(
        () => document.querySelectorAll("path.rsm-line").length,
      );
      expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 5000 });
  });

  test("visited countries are gold and unvisited are dark", async ({
    page,
  }) => {
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll("svg path")).some(
          (p) => (p as SVGPathElement).getAttribute("fill") === "#b8922f",
        ),
      { timeout: 15000 },
    );

    const fills = await page.evaluate(() => {
      const paths = Array.from(document.querySelectorAll("svg path"));
      const gold = paths.filter(
        (p) => (p as SVGPathElement).getAttribute("fill") === "#b8922f",
      ).length;
      const dark = paths.filter(
        (p) => (p as SVGPathElement).getAttribute("fill") === "#2a2a2a",
      ).length;
      return { gold, dark };
    });

    // Should have both visited (gold) and unvisited (dark) countries
    expect(fills.gold).toBeGreaterThan(10);
    expect(fills.dark).toBeGreaterThan(fills.gold); // most countries unvisited
  });
});
