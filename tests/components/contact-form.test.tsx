// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "../../src/components/ContactForm";
import harborline from "../../sites/harborline/site.config";
import { liveVariant } from "../fixtures/live-site";
import { renderWithSite } from "./helpers";

afterEach(cleanup);

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Pat Example");
  await user.type(screen.getByLabelText("Email"), "pat@example.com");
  await user.selectOptions(screen.getByLabelText("Topic"), "Boiler service");
  await user.type(screen.getByLabelText("Message"), "Knocking noise from the boiler.");
}

describe("ContactForm", () => {
  it("invalid submit: error summary gets focus, fields are marked invalid and described", async () => {
    const user = userEvent.setup();
    renderWithSite(harborline, <ContactForm formKey="contact" config={harborline.forms.contact} />);
    await user.click(screen.getByRole("button", { name: "Request a visit" }));
    const summary = await screen.findByRole("alert");
    expect(summary.textContent).toMatch(/Please fix these 4 fields/);
    await vi.waitFor(() => expect(document.activeElement).toBe(summary));
    const email = screen.getByLabelText("Email");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(email.getAttribute("aria-describedby")!)?.textContent).toBe("Enter a valid email address");
  });

  it("demo provider: says plainly that nothing was sent and makes no request", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderWithSite(harborline, <ContactForm formKey="contact" config={harborline.forms.contact} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Request a visit" }));
    expect(await screen.findByText("Demo only: nothing was sent")).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("endpoint failure: shows the error, keeps the answers, offers the confirmed phone", async () => {
    const user = userEvent.setup();
    const live = liveVariant();
    const post = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    renderWithSite(live, <ContactForm formKey="contact" config={live.forms.contact} post={post} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Request a visit" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/Your message was not sent.*call \(555\) 010-0142/s);
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Pat Example");
  });

  it("endpoint success: confirms delivery and hides the form", async () => {
    const user = userEvent.setup();
    const live = liveVariant();
    renderWithSite(live, <ContactForm formKey="contact" config={live.forms.contact} post={vi.fn().mockResolvedValue({ ok: true, status: 200 })} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Request a visit" }));
    expect(await screen.findByText("Message sent")).toBeTruthy();
    expect(screen.queryByLabelText("Name")).toBeNull();
  });
});
