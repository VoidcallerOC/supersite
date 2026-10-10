import { describe, expect, it, vi } from "vitest";
import { validateContact } from "../../src/integrations/forms/contact-schema";
import { mailtoHref, submitContact } from "../../src/integrations/forms/submit";
import { handleContact, memoryRateLimiter } from "../../src/integrations/forms/contact-handler";

const good = {
  name: "Pat Example",
  email: "pat@example.com",
  phone: "",
  topic: "Boiler service",
  message: "The boiler is making a knocking noise.",
  website: "",
};

describe("validateContact", () => {
  it("accepts a valid submission and trims", () => {
    expect(validateContact({ ...good, name: "  Pat Example " })).toEqual({ ok: true, data: good });
  });
  it("reports each invalid field once with a human message", () => {
    const r = validateContact({ name: "P", email: "nope", phone: "123", topic: "", message: "short" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(["email", "message", "name", "phone", "topic"]);
    expect(r.errors.email).toBe("Enter a valid email address");
  });
});

describe("submitContact never claims success it cannot verify", () => {
  it("demo provider: does not call the network", async () => {
    const post = vi.fn();
    expect(await submitContact({ provider: "demo" }, good, { siteName: "S", post })).toEqual({ kind: "demo" });
    expect(post).not.toHaveBeenCalled();
  });
  it("mailto provider: hands off, does not claim sent", async () => {
    const r = await submitContact({ provider: "mailto", to: "office@example.com" }, good, { siteName: "Shop" });
    expect(r.kind).toBe("handoff");
    expect(mailtoHref("office@example.com", "Shop", good)).toContain("subject=Shop%3A%20Boiler%20service");
  });
  it("endpoint: sent only on 2xx", async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    expect(await submitContact({ provider: "endpoint", url: "/api/contact" }, good, { siteName: "S", post })).toEqual({ kind: "sent" });
    expect(JSON.parse(post.mock.calls[0][1].body)).toEqual(good);
  });
  it.each([
    [{ ok: false, status: 429 }, /Too many/],
    [{ ok: false, status: 500 }, /did not accept/],
  ])("endpoint failure %o is reported", async (res, msg) => {
    const r = await submitContact({ provider: "endpoint", url: "/x" }, good, { siteName: "S", post: vi.fn().mockResolvedValue(res) });
    expect(r).toMatchObject({ kind: "failed", reason: expect.stringMatching(msg) });
  });
  it("endpoint network error is reported", async () => {
    const r = await submitContact({ provider: "endpoint", url: "/x" }, good, { siteName: "S", post: vi.fn().mockRejectedValue(new Error("offline")) });
    expect(r.kind).toBe("failed");
  });
});

describe("reference contact handler", () => {
  const deps = (over = {}) => ({ deliver: vi.fn().mockResolvedValue(undefined), allow: () => true, ...over });

  it("delivers valid submissions", async () => {
    const d = deps();
    expect(await handleContact(good, "k", d)).toEqual({ status: 200, body: { ok: true } });
    expect(d.deliver).toHaveBeenCalledWith(good);
  });
  it("silently drops honeypot hits", async () => {
    const d = deps();
    expect((await handleContact({ ...good, website: "spam.example" }, "k", d)).status).toBe(200);
    expect(d.deliver).not.toHaveBeenCalled();
  });
  it("422 with field errors on invalid input; 400 on non-object", async () => {
    expect(await handleContact({ ...good, email: "x" }, "k", deps())).toMatchObject({ status: 422, body: { fields: { email: expect.any(String) } } });
    expect((await handleContact("nope", "k", deps())).status).toBe(400);
  });
  it("429 when rate limited, 502 when delivery fails", async () => {
    expect((await handleContact(good, "k", deps({ allow: () => false }))).status).toBe(429);
    expect((await handleContact(good, "k", deps({ deliver: vi.fn().mockRejectedValue(new Error("smtp")) }))).status).toBe(502);
  });
  it("memory rate limiter enforces a fixed window", () => {
    let t = 0;
    const allow = memoryRateLimiter(2, 1000, () => t);
    expect([allow("a"), allow("a"), allow("a"), allow("b")]).toEqual([true, true, false, true]);
    t = 1001;
    expect(allow("a")).toBe(true);
  });
});
