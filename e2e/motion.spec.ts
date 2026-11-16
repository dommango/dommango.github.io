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

  test("holds the headline's layout while it decodes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    const headline = page.locator("#hero h1");
    // Mid-decode: characters are still showing noise glyphs.
    expect(await noiseCells(page)).toBeGreaterThan(0);
    const decoding = await headline.boundingBox();

    await expect.poll(() => noiseCells(page), { timeout: 10000 }).toBe(0);
    const settled = await headline.boundingBox();

    // Each character keeps its real glyph in the layout and the noise is drawn
    // over it, so resolving cannot move anything — that is the CLS guarantee.
    expect(decoding!.width).toBeCloseTo(settled!.width, 1);
    expect(decoding!.height).toBeCloseTo(settled!.height, 1);
    expect(decoding!.y).toBeCloseTo(settled!.y, 1);
  });
});

test.describe("Theme switch", () => {
  test("cycles the palette through all three themes", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /gold|oxblood|contrast/i });
    expect(await theme(page)).toEqual({ accent: "gold", contrast: "default" });

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

    await button.click();
    await expect.poll(() => theme(page)).toEqual({
      accent: "gold",
      contrast: "default",
    });
  });

  test("changes the theme with no view transition support", async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error - removing the API is the point
      delete Document.prototype.startViewTransition;
    });
    await page.goto("/");
    await page.getByRole("button", { name: /gold/i }).click();
    await expect.poll(() => theme(page)).toEqual({
      accent: "oxblood",
      contrast: "default",
    });
  });

  test("changes the theme instantly for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: /gold/i }).click();
    await expect.poll(() => theme(page)).toEqual({
      accent: "oxblood",
      contrast: "default",
    });
  });
});
