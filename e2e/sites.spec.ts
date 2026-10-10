import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SITES = {
  harborline: { port: 4101, paths: ["/", "/services/", "/service-area/", "/about/", "/contact/", "/missing-page/"] },
  lantern: {
    port: 4102,
    paths: [
      "/",
      "/shop/",
      "/shop/ember-warden-holo/",
      "/events/",
      "/events/starfall-prerelease-2026-10-17/",
      "/news/",
      "/news/prerelease-registration-open/",
      "/visit/",
    ],
  },
  tallyhook: { port: 4103, paths: ["/", "/pricing/", "/changelog/"] },
} as const;

const url = (site: keyof typeof SITES, path: string) => `http://127.0.0.1:${SITES[site].port}${path}`;

async function noHorizontalScroll(page: Page) {
  const { scroll, client } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(scroll, "page must not scroll sideways").toBeLessThanOrEqual(client);
}

for (const site of Object.keys(SITES) as (keyof typeof SITES)[]) {
  for (const path of SITES[site].paths) {
    test(`${site}${path}: renders, hydrates without errors, fits the viewport, passes axe`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(m.text()));
      const res = await page.goto(url(site, path));
      expect(res?.status()).toBe(path === "/missing-page/" ? 404 : 200);
      await expect(page.locator("h1")).toHaveCount(1);
      await page.waitForLoadState("networkidle");
      await noHorizontalScroll(page);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        serious.map(
          (v) =>
            `${v.id}: ${v.nodes
              .map((n) => n.target.join(" "))
              .slice(0, 3)
              .join(", ")}`,
        ),
      ).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test("skip link is the first tab stop and moves focus to main", async ({ page }) => {
  await page.goto(url("harborline", "/services/"));
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("focus is visible on interactive elements", async ({ page }) => {
  await page.goto(url("tallyhook", "/"));
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe("none");
});

test("mobile menu: keyboard open, Escape closes and restores focus", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "menu button only shows on small screens");
  await page.goto(url("lantern", "/"));
  const button = page.getByRole("button", { name: "Menu" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Events", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();
});

test("contact form: validation errors, then honest demo result", async ({ page }) => {
  await page.goto(url("harborline", "/contact/"));
  await page.getByRole("button", { name: "Request a visit" }).last().click();
  await expect(page.getByRole("alert")).toContainText("Please fix these 4 fields");
  await page.getByLabel("Name").fill("Pat Example");
  await page.getByLabel("Email").fill("pat@example.com");
  await page.getByLabel("Topic").selectOption("Boiler service");
  await page.getByLabel("Message").fill("Knocking noise from the boiler.");
  await page.getByRole("button", { name: "Request a visit" }).last().click();
  await expect(page.getByText("Demo only: nothing was sent")).toBeVisible();
});

test("catalog: filters update results and the shareable URL; URL restores filters", async ({ page }) => {
  await page.goto(url("lantern", "/shop/"));
  await expect(page.getByText("Showing 11 of 11 products")).toBeVisible();
  await page.getByLabel("Category").selectOption("singles");
  await expect(page.getByText("Showing 3 of 11 products")).toBeVisible();
  await expect(page).toHaveURL(/\?category=singles$/);
  await page.goto(url("lantern", "/shop/?category=board-games&stock=1"));
  await expect(page.getByText("Showing 2 of 11 products")).toBeVisible();
  await expect(page.getByLabel("Category")).toHaveValue("board-games");
});

test("events: past events drop off after hydration; cancelled events are labelled", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-10T12:00:00-04:00"));
  await page.goto(url("lantern", "/events/"));
  await expect(page.getByRole("link", { name: "Starfall Drakes Prerelease" })).toBeVisible();
  await expect(page.locator('a[href="/events/friday-night-draft-2026-09-25/"]')).toHaveCount(0);
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
});

test("works without JavaScript: content and navigation are in the HTML", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(url("lantern", "/shop/"));
  await expect(page.getByRole("link", { name: "Ember Warden (Holo)" })).toBeVisible();
  await page.getByRole("contentinfo").getByRole("link", { name: "Events" }).click();
  await expect(page.locator("h1")).toHaveText("Events");
  await ctx.close();
});

test("reduced motion is respected", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(url("tallyhook", "/"));
  const d = await page
    .locator(".btn")
    .first()
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(parseFloat(d)).toBeLessThan(0.01);
  await ctx.close();
});

test("screenshots for visual review", async ({ page }, info) => {
  for (const [site, path] of [
    ["harborline", "/"],
    ["lantern", "/"],
    ["lantern", "/shop/"],
    ["tallyhook", "/"],
    ["tallyhook", "/pricing/"],
  ] as const) {
    await page.goto(url(site, path));
    await page.waitForLoadState("networkidle");
    const name = `${site}${path === "/" ? "-home" : path.replace(/\//g, "-").replace(/-$/, "")}-${info.project.name}.png`;
    await page.screenshot({ path: `docs/screenshots/${name}`, fullPage: true });
  }
});
