import type { Product, SectionOf, SectionType } from "../core/schema";
import type { ProviderResult } from "../integrations/result";

export type SectionProps<T extends SectionType> = {
  section: SectionOf<T>;
  /** Catalog result for pages that render catalog sections; null elsewhere. */
  catalog: ProviderResult<Product[]> | null;
  /** True for the first visible section on the page (receives the h1 when it is a hero). */
  isFirst: boolean;
};
