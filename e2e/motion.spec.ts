import { test, expect, type Page } from "@playwright/test";

const HEADLINE = ["Unapologetically", "AI-pilled."];
const ROOT = ".brutalist-root";

const noiseCells = (page: Page) =>
  page.locator("#hero .decode-ch.is-noise").count();

const theme = (page: Page) =>
  page.locator(ROOT).evaluate((el) => ({
    accent: el.getAttribute("data-accent"),
    contrast: el.getAttribute("data-contrast"),
  }));

test.describe("Hero decode", () => {
  test("keeps the headline readable and in the accessible tree throughout", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    // Absorbs a slow first compile before the assertions below start counting.
    await expect(page.locator("#hero h1")).toBeVisible({ timeout: 20000 });

    // The real text is a single sr-only node per line, so the decode never
    // changes what a screen reader reads, however far along it is.
    for (const line of HEADLINE) {
      await expect(page.locator("#hero .sr-only", { hasText: line })).toHaveCount(1);
    }
    await expect(page.locator("#hero h1")).toContainText(HEADLINE[0]);
    await expect(page.locator("#hero h1")).toContainText(HEADLINE[1]);
  });

  test("hides the scrambled copy from assistive tech", async ({ page }) => {
    await page.goto("/");
    const hosts = page.locator("#hero .decode");
    await expect(hosts).toHaveCount(HEADLINE.length);
    for (let i = 0; i < HEADLINE.length; i++) {
      await expect(hosts.nth(i)).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("resolves every character on load", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect.poll(() => noiseCells(page), { timeout: 10000 }).toBe(0);
  });

  test("settles immediately for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect.poll(() => noiseCells(page), { timeout: 3000 }).toBe(0);
  });

  test("resolves without shifting the page", async ({ page }) => {
    await page.addInitScript(() => {
      const shifts: number[] = []
      ;(window as unknown as { __shifts: number[] }).__shifts = shifts
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
          if (!shift.hadRecentInput) shifts.push(shift.value)
        }
      }).observe({ type: "layout-shift", buffered: true })
    })
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    // Every character keeps its real glyph in the layout and the noise is
    // painted over it, so a full decode must not move anything on the page.
    await expect.poll(() => noiseCells(page), { timeout: 10000 }).toBe(0);
    const shifted = await page.evaluate(
      () => (window as unknown as { __shifts: number[] }).__shifts.reduce((a, b) => a + b, 0),
    );
    expect(shifted).toBe(0);
  });
});

test.describe("Theme switch", () => {
  // High Contrast is the landing default, so the cycle reads
  // High Contrast -> Gold -> Oxblood -> High Contrast.
  const TOGGLE = /gold|oxblood|contrast/i;

  test("lands on High Contrast before any interaction", async ({ page }) => {
    await page.goto("/");
    expect(await theme(page)).toEqual({ accent: "gold", contrast: "high" });
    await expect(page.getByRole("button", { name: TOGGLE })).toHaveText(
      /high contrast/i,
    );
  });

  test("cycles the palette through all three themes", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: TOGGLE });
    expect(await theme(page)).toEqual({ accent: "gold", contrast: "high" });

    await button.click();
    await expect.poll(() => theme(page)).toEqual({
      accent: "gold",
      contrast: "default",
    });

    await button.click();
    await expect.poll(() => theme(page)).toEqual({
      accent: "oxblood",
      contrast: "default",
    });

    await button.click();
    await expect.poll(() => theme(page)).toEqual({
      accent: "gold",
      contrast: "high",
    });
  });

  test("changes the theme with no view transition support", async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error - removing the API is the point
      delete Document.prototype.startViewTransition;
    });
    await page.goto("/");
    await page.getByRole("button", { name: TOGGLE }).click();
    await expect.poll(() => theme(page)).toEqual({
      accent: "gold",
      contrast: "default",
    });
  });

  test("changes the theme instantly for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: TOGGLE }).click();
    await expect.poll(() => theme(page)).toEqual({
      accent: "gold",
      contrast: "default",
    });
  });
});
