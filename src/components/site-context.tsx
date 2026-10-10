import { createContext, useContext } from "react";
import type { SiteConfig } from "../core/schema";

const SiteContext = createContext<SiteConfig | null>(null);
export const SiteProvider = SiteContext.Provider;

export function useSite(): SiteConfig {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite must be used inside <SiteProvider>");
  return site;
}
