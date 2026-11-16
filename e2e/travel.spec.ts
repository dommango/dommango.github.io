import { test, expect, type Page } from "@playwright/test";
import { getTravelData, countriesUpTo } from "../lib/content/travel";

const { countries } = getTravelData();

// These cover the section as it behaves unpinned, which is what reduced motion,
// no JS and no sticky support all get: the reel does not drive the year, so the
// manual scrubber is the control and the globe holds its final state. The
// pinned reel has its own spec.
const GLOBE_SETTLED_MS = 500;

const GLOBE_CANVAS = "#travel canvas.globe-canvas";

async function waitForGlobe(page: Page) {
  await page.waitForFunction(
    (selector) => {
      const canvas = document.querySelector(selector) as HTMLCanvasElement | null;
      return !!canvas && canvas.width > 0 && canvas.height > 0;
    },
    GLOBE_CANVAS,
    { timeout: 20000 },
  );
  await page.waitForTimeout(GLOBE_SETTLED_MS);
}

/** Pixels the globe has actually painted, so a blank canvas cannot pass. */
function paintedPixels(page: Page) {
  return page.evaluate((selector) => {
    const canvas = document.querySelector(selector) as HTMLCanvasElement;
    const data = canvas
      .getContext("2d")!
      .getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) painted++;
    return painted;
  }, GLOBE_CANVAS);
}

/** What the canvas currently shows, for before/after comparisons. */
function globeSignature(page: Page) {
  return page.evaluate((selector) => {
    const canvas = document.querySelector(selector) as HTMLCanvasElement;
    return canvas.toDataURL();
  }, GLOBE_CANVAS);
}

test.describe("Travel map", () => {
  test.beforeEach(async ({ page }) => {
    // Set on the page rather than through test.use, which does not reach the
    // emulated media query under this config.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // "My Travel Map" was pre-brutalist copy and no longer exists, so this
    // hook failed on every test. Scroll to the map frame itself — the globe
    // chunk now mounts as the map nears the viewport and draws in once the
    // frame is on screen, not on page hydration.
    await page.locator(".travel-map-frame").scrollIntoViewIfNeeded();
  });

  test("paints the globe onto a canvas", async ({ page }) => {
    await waitForGlobe(page);
    expect(await paintedPixels(page)).toBeGreaterThan(1000);
  });

  test("shows country and continent count", async ({ page }) => {
    await expect(
      page.getByText(/countries across \d+ continents/i),
    ).toBeVisible();
  });

  test("names every visited country for assistive tech", async ({ page }) => {
    // The canvas carries no accessible content, so this list is the globe as
    // far as a screen reader is concerned.
    const items = page.locator("#travel .globe-countries li");
    await expect(items).toHaveCount(countries.length);
    await expect(items.first()).toContainText(/first visited \d{4}/);
  });

  test("flight toggle repaints the globe", async ({ page }) => {
    await waitForGlobe(page);
    const withRoutes = await globeSignature(page);

    const toggle = page.getByRole("button", { name: /flight/i });
    await toggle.click();
    await expect
      .poll(() => globeSignature(page), { timeout: 10000 })
      .not.toBe(withRoutes);
    const withoutRoutes = await globeSignature(page);

    await toggle.click();
    await expect
      .poll(() => globeSignature(page), { timeout: 10000 })
      .not.toBe(withoutRoutes);
  });

  test("year scrubber filters the globe and the bars", async ({ page }) => {
    await waitForGlobe(page);
    const slider = page.getByRole("slider", {
      name: /countries first visited/i,
    });
    await slider.fill("2000");
    await expect(page.locator("#travel .scrub-year")).toHaveText("2000");

    const byThen = countriesUpTo(countries, 2000).length;
    expect(byThen).toBeGreaterThan(0);
    expect(byThen).toBeLessThan(countries.length);
    await expect(page.locator("#travel .globe-countries li")).toHaveCount(byThen);
  });

  test("globe rotates with the keyboard", async ({ page }) => {
    await waitForGlobe(page);
    const before = await globeSignature(page);
    await page.getByRole("group", { name: /globe showing/i }).focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => globeSignature(page), { timeout: 10000 })
      .not.toBe(before);
  });
});
