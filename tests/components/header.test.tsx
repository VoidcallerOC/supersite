// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../../src/components/Header";
import lantern from "../../sites/lantern/site.config";
import harborline from "../../sites/harborline/site.config";
import { renderWithSite } from "./helpers";

afterEach(cleanup);

describe("Header / mobile navigation", () => {
  it("toggles with aria-expanded and closes on Escape, returning focus to the button", async () => {
    const user = userEvent.setup();
    renderWithSite(lantern, <Header currentPath="/events/" />);
    const button = screen.getByRole("button", { name: /menu/i });
    const panel = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);

    await user.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hidden).toBe(false);

    await user.tab();
    await user.keyboard("{Escape}");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button);
  });

  it("marks the current section with aria-current", () => {
    renderWithSite(lantern, <Header currentPath="/events/" />);
    const main = screen.getByRole("navigation", { name: "Main" });
    expect(main.querySelector('[aria-current="page"]')?.textContent).toBe("Events");
  });

  it("shows the demo phone as plain text, never as a tel: link or a per-item pill", () => {
    renderWithSite(harborline, <Header currentPath="/" />);
    expect(screen.getByText(/Call \(555\) 010-0142/)).toBeTruthy();
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(screen.queryByText("Demo")).toBeNull();
  });

  it("still tags unconfirmed facts with To confirm", () => {
    const site = { ...harborline, business: { ...harborline.business, phone: { ...harborline.business.phone!, status: "unconfirmed" as const } } };
    renderWithSite(site, <Header currentPath="/" />);
    expect(screen.getByText("To confirm")).toBeTruthy();
    expect(document.querySelector('a[href="tel:+15550100142"]')).not.toBeNull();
  });
});
