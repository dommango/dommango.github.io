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

  test("map shades visited countries", async ({ page }) => {
    await expect(async () => {
      const visitedCount = await page.evaluate(
        () => document.querySelectorAll('svg path[data-visited="true"]').length,
      );
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

  test("visited and unvisited countries are both represented", async ({
    page,
  }) => {
    await page.waitForFunction(
      () => document.querySelectorAll('svg path[data-visited="true"]').length > 0,
      { timeout: 15000 },
    );

    const counts = await page.evaluate(() => ({
      visited: document.querySelectorAll('svg path[data-visited="true"]').length,
      unvisited: document.querySelectorAll('svg path[data-visited="false"]').length,
    }));

    // Should have both visited and unvisited countries
    expect(counts.visited).toBeGreaterThan(10);
    expect(counts.unvisited).toBeGreaterThan(counts.visited); // most countries unvisited
  });

  test("year scrubber filters the map and the bars", async ({ page }) => {
    // Geographies load async from the local atlas JSON — wait for the map to
    // actually have rendered countries before scrubbing, or the count below
    // races the fetch and always reads 0.
    await page.waitForFunction(
      () => document.querySelectorAll("#travel svg path[data-visited]").length > 0,
      { timeout: 15000 },
    );
    const slider = page.getByRole("slider", { name: /countries first visited/i });
    await slider.fill("2000");
    await expect(page.locator("#travel .scrub-year")).toHaveText("2000");
    await expect(async () => {
      const visited = await page.locator('#travel path[data-visited="true"]').count();
      expect(visited).toBeGreaterThan(0);
      expect(visited).toBeLessThan(20);
    }).toPass({ timeout: 5000 });
  });

  test("globe rotates with the keyboard", async ({ page }) => {
    // Target a visited-country path, not the globe's own outline (Sphere,
    // whose silhouette is a fixed-radius circle regardless of rotation) and
    // not just any [data-visited] path — some small/degenerate geographies
    // render with no `d` at all, and .first() can land on one of those.
    await page.waitForFunction(
      () => document.querySelectorAll('#travel svg path[data-visited="true"]').length > 0,
      { timeout: 15000 },
    );
    const globe = page.getByRole("img", { name: /globe showing/i });
    await globe.focus();
    const country = page.locator('#travel svg path[data-visited="true"]').first();
    const before = await country.getAttribute("d");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => country.getAttribute("d")).not.toBe(before);
  });
});
