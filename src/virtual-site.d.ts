declare module "virtual:site" {
  import type { SiteConfig } from "./core/schema";
  const site: SiteConfig;
  export default site;
}

declare module "virtual:site-styles";
