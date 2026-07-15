import { test, expect } from "@playwright/test";
import { PROJECTS } from "../lib/content/projects";
import { POSTS } from "../lib/content/writing";

test.describe("Landing structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("leads with projects, not the resume", async ({ page }) => {
    const projectsTop = await page
      .locator("#projects")
      .evaluate((el: HTMLElement) => el.offsetTop);
    const resumeTop = await page
      .locator("#resume")
      .evaluate((el: HTMLElement) => el.offsetTop);

    expect(projectsTop).toBeLessThan(resumeTop);
  });

  test("renders a card for every project", async ({ page }) => {
    await expect(page.locator("#projects .work-card")).toHaveCount(
      PROJECTS.length,
    );

    for (const project of PROJECTS) {
      await expect(
        page.locator("#projects").getByText(project.name, { exact: true }),
      ).toBeVisible();
    }
  });

  test("linked project cards are anchors with a real href", async ({ page }) => {
    const linked = PROJECTS.filter((p) => p.href);

    for (const project of linked) {
      const card = page.locator(`#projects a.work-card[href="${project.href}"]`);
      await expect(card).toHaveAttribute("target", "_blank");
      await expect(card).toHaveAttribute("rel", /noreferrer/);
    }

    // Projects with no public repo and no live URL must not render as links.
    await expect(page.locator("#projects a.work-card")).toHaveCount(
      linked.length,
    );
  });

  test("project cards are keyboard focusable", async ({ page }) => {
    const firstLinked = page.locator("#projects a.work-card").first();
    await firstLinked.focus();
    await expect(firstLinked).toBeFocused();
  });

  // The core invariant of the redesign: Writing stays invisible until the
  // Substack has real posts, rather than shipping a "Coming soon" stub.
  test("writing section and nav link track post count together", async ({
    page,
  }) => {
    const expected = POSTS.length > 0 ? 1 : 0;

    await expect(page.locator("#writing")).toHaveCount(expected);
    await expect(
      page.locator(".nav-links").getByText("Writing", { exact: true }),
    ).toHaveCount(expected);
  });

  test("no career-first content survives on the page", async ({ page }) => {
    await expect(page.locator(".themes-grid")).toHaveCount(0);
    await expect(page.getByText("Request CV")).toHaveCount(0);
    await expect(page.getByText(/Harnessing AI/i)).toHaveCount(0);
  });

  test("nav is reachable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.locator(".nav-links").getByText("Projects", { exact: true }),
    ).toBeVisible();
  });
});

// The long headline and the wide-tracked contact echo each blew past the
// viewport on phones. Nothing should make the page scroll sideways.
test.describe("No horizontal overflow", () => {
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    test(`page does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
});
