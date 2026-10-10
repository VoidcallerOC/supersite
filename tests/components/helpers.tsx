import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { SiteProvider } from "../../src/components/site-context";
import type { SiteConfig } from "../../src/core/schema";

export function renderWithSite(site: SiteConfig, ui: ReactElement) {
  return render(<SiteProvider value={site}>{ui}</SiteProvider>);
}
