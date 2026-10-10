import { useSite } from "./site-context";
import { FactTag } from "./ui";
import { viewFact, telHref, directionsHref } from "../core/facts";
import { DAY_LABEL, DAY_ORDER, formatRanges } from "../core/hours";
import { OpenNow } from "./OpenNow";

/** Hours and location from the single source of truth in site.business. */
export function LocationCard({ wide = false }: { wide?: boolean }) {
  const site = useSite();
  const address = viewFact(site, site.business.address);
  const hours = viewFact(site, site.business.hours);
  const phone = viewFact(site, site.business.phone);
  const area = viewFact(site, site.business.serviceArea);
  if (!address.show && !hours.show && !phone.show && !area.show) return null;

  return (
    <div className={`card p-6 text-ink sm:p-8 ${wide ? "grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12" : "space-y-6"}`}>
      <div className="space-y-6">
        {address.show ? (
          <div>
            <h3 className="text-base">
              Address <FactTag tag={address.tag} />
            </h3>
            <p className="mt-1">
              {address.value.street}
              <br />
              {address.value.locality}, {address.value.region} {address.value.postalCode}
            </p>
            {address.tag !== "demo" ? (
              <a className="mt-2 inline-block font-semibold" href={directionsHref(address.value)} rel="noopener noreferrer">
                Get directions<span className="sr-only"> (opens Google Maps)</span>
              </a>
            ) : null}
          </div>
        ) : null}
        {phone.show ? (
          <div>
            <h3 className="text-base">
              Phone <FactTag tag={phone.tag} />
            </h3>
            <p className="mt-1">{phone.tag === "demo" ? phone.value : <a href={telHref(phone.value)}>{phone.value}</a>}</p>
          </div>
        ) : null}
        {area.show ? (
          <div>
            <h3 className="text-base">
              Service area <FactTag tag={area.tag} />
            </h3>
            <p className="mt-1">{area.value.join(", ")}</p>
          </div>
        ) : null}
      </div>
      {hours.show ? (
        <div>
          <h3 className="text-base">
            Hours <FactTag tag={hours.tag} />
          </h3>
          <OpenNow hours={hours.value} className="mt-1 text-sm font-semibold" />
          <table className="mt-2 w-full text-left text-sm">
            <caption className="sr-only">Opening hours ({hours.value.timezone})</caption>
            <tbody>
              {DAY_ORDER.map((d) => {
                const entry = hours.value.days.find((x) => x.day === d);
                return (
                  <tr key={d} className="border-b border-border last:border-0">
                    <th scope="row" className="py-1.5 pr-4 font-semibold">
                      {DAY_LABEL[d]}
                    </th>
                    <td className="py-1.5">{formatRanges(entry?.ranges ?? [])}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {hours.value.note ? <p className="mt-2 text-sm text-muted">{hours.value.note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
