import { test, expect, type Page } from "@playwright/test";
import { getTravelData, yearBounds } from "../lib/content/travel";

const { countries } = getTravelData();
const [FIRST_YEAR, LAST_YEAR] = yearBounds(countries);

const REEL = "#travel .travel-reel";
const STAGE = "#travel .travel-reel-stage";

/** Scrolls to a fraction of the way through the reel's pin distance. */
async function scrubTo(page: Page, fraction: number) {
  await page.evaluate(
    ({ selector, at }) => {
      const reel = document.querySelector(selector) as HTMLElement;
      const box = reel.getBoundingClientRect();
      const start = window.scrollY + box.top;
      window.scrollTo(0, start + (box.height - window.innerHeight) * at);
    },
    { selector: REEL, at: fraction },
  );
  // The hook measures in a frame, then React paints the new year.
  await page.waitForTimeout(150);
}

const year = (page: Page) =>
  page.locator("#travel .scrub-year").textContent().then((text) => Number(text));

const stageTop = (page: Page) =>
  page.locator(STAGE).evaluate((el) => el.getBoundingClientRect().top);

test.describe("Travel reel, scrubbed by scroll", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
  });

  test("pins the stage while the page scrolls through the reel", async ({
    page,
  }) => {
    await expect(page.locator(STAGE)).toHaveCSS("position", "sticky");

    await scrubTo(page, 0.25);
    const quarter = await stageTop(page);
    await scrubTo(page, 0.75);
    const threeQuarters = await stageTop(page);

    // Pinned: the stage holds at the top of the viewport across a scroll that
    // moved the page by most of a screen height.
    expect(Math.abs(quarter)).toBeLessThan(2);
    expect(Math.abs(threeQuarters)).toBeLessThan(2);
  });

  test("advances the year as the reel is scrolled", async ({ page }) => {
    await scrubTo(page, 0);
    expect(await year(page)).toBe(FIRST_YEAR);

    await scrubTo(page, 0.5);
    const middle = await year(page);
    expect(middle).toBeGreaterThan(FIRST_YEAR);
    expect(middle).toBeLessThan(LAST_YEAR);

    await scrubTo(page, 1);
    expect(await year(page)).toBe(LAST_YEAR);
  });

  test("grows the countries the globe lists as the year advances", async ({
    page,
  }) => {
    const items = page.locator("#travel .globe-countries li");
    await scrubTo(page, 0);
    const atStart = await items.count();

    await scrubTo(page, 1);
    expect(await items.count()).toBeGreaterThan(atStart);
    expect(await items.count()).toBe(countries.length);
  });

  test("hands the year to scroll, so the manual scrubber steps aside", async ({
    page,
  }) => {
    await scrubTo(page, 0.5);
    await expect(page.locator("#travel .scrub-manual")).toBeHidden();
    await expect(page.locator("#travel .scrub .ds-eyebrow")).toHaveText(
      /scroll is the year/i,
    );
  });

  test("keeps the year silent for screen readers while scroll drives it", async ({
    page,
  }) => {
    // 41 years in a few seconds of scrolling would otherwise be announced.
    await scrubTo(page, 0.5);
    await expect(page.locator("#travel .scrub-year")).toHaveAttribute(
      "aria-live",
      "off",
    );
  });
});

test.describe("Travel reel with reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#travel").scrollIntoViewIfNeeded();
  });

  test("leaves the stage unpinned and in normal flow", async ({ page }) => {
    await expect(page.locator(STAGE)).toHaveCSS("position", "static");

    const before = await stageTop(page);
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(150);
    // Unpinned: the stage scrolls with the page instead of holding at the top.
    expect(await stageTop(page)).toBeLessThan(before - 200);
  });

  test("leaves every part of the section visible", async ({ page }) => {
    await expect(page.locator("#travel .travel-title")).toBeVisible();
    await expect(page.locator("#travel .continent-list")).toBeVisible();
    await expect(page.locator("#travel .scrub-year")).toBeVisible();
    await expect(page.locator("#travel .map-frame")).toBeVisible();
    await expect(page.locator("#travel .travel-map-cap")).toBeVisible();
  });

  test("keeps the manual scrubber and Play as the controls", async ({
    page,
  }) => {
    const slider = page.getByRole("slider", {
      name: /countries first visited/i,
    });
    await expect(slider).toBeVisible();
    await slider.fill("1995");
    await expect(page.locator("#travel .scrub-year")).toHaveText("1995");

    const play = page.getByRole("button", { name: /play/i });
    await expect(play).toBeVisible();
    await play.click();
    // Play restarts from the first year and runs forward on its own.
    await expect
      .poll(() => year(page), { timeout: 10000 })
      .toBeGreaterThan(FIRST_YEAR);
  });

  test("announces the year politely when it is not being scrubbed", async ({
    page,
  }) => {
    await expect(page.locator("#travel .scrub-year")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });
});
