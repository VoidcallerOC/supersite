import { useSite } from "./site-context";
import { FactTag, Monogram } from "./ui";
import { viewFact, telHref } from "../core/facts";

export function Footer() {
  const site = useSite();
  const phone = viewFact(site, site.business.phone);
  const email = viewFact(site, site.business.email);
  const address = viewFact(site, site.business.address);
  const social = site.business.social.map((s) => ({ label: s.label, v: viewFact(site, s.href) })).filter((s) => s.v.show);
  const year = new Date().getFullYear();

  return (
    <footer className="tone-inverse mt-auto">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-3">
            <Monogram text={site.brand.monogram} />
            <p className="font-heading text-lg font-bold">{site.brand.name}</p>
          </div>
          <p className="mt-4 max-w-sm opacity-80">{site.footer.blurb}</p>
          <address className="mt-4 space-y-1 not-italic opacity-90">
            {address.show ? (
              <p>
                {address.value.street}, {address.value.locality}, {address.value.region} {address.value.postalCode}
                <FactTag tag={address.tag} />
              </p>
            ) : null}
            {phone.show ? (
              <p>
                {phone.tag === "demo" ? phone.value : <a href={telHref(phone.value)}>{phone.value}</a>}
                <FactTag tag={phone.tag} />
              </p>
            ) : null}
            {email.show ? (
              <p>
                {email.tag === "demo" ? email.value : <a href={`mailto:${email.value}`}>{email.value}</a>}
                <FactTag tag={email.tag} />
              </p>
            ) : null}
          </address>
        </div>
        <nav aria-label="Site" className="contents">
          {[{ heading: "Explore", links: site.nav }, ...site.footer.columns].map((col) => (
            <div key={col.heading}>
              <h2 className="eyebrow mb-3 text-sm opacity-80 [font-family:var(--f-label)] [text-transform:uppercase]">{col.heading}</h2>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <a href={l.href} className="opacity-90 hover:opacity-100">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {social.length ? (
          <div>
            <h2 className="eyebrow mb-3 text-sm opacity-80">Follow</h2>
            <ul className="space-y-2">
              {social.map((s) =>
                s.v.show ? (
                  <li key={s.label}>
                    {s.v.tag === "demo" ? (
                      <span>{s.label}</span>
                    ) : (
                      <a href={s.v.value} rel="noopener noreferrer">
                        {s.label}
                      </a>
                    )}
                    <FactTag tag={s.v.tag} />
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="border-t border-current/20">
        <p className="container-site py-5 text-sm opacity-75">
          © {year} {site.brand.name}. {site.footer.legal ?? ""}
        </p>
      </div>
    </footer>
  );
}
