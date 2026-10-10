import type { ComponentType } from "react";
import type { Product, Section } from "../core/schema";
import type { ProviderResult } from "../integrations/result";
import { SECTIONS } from "../sections/registry";
import type { SectionProps } from "../sections/types";

export function SectionList({
  sections,
  catalog,
  hasPageHeading,
}: {
  sections: Section[];
  catalog: ProviderResult<Product[]> | null;
  hasPageHeading: boolean;
}) {
  const visible = sections.filter((s) => !s.hidden);
  return (
    <>
      {visible.map((section, i) => {
        const Component = SECTIONS[section.type] as ComponentType<SectionProps<typeof section.type>>;
        return <Component key={section.id} section={section} catalog={catalog} isFirst={i === 0 && !hasPageHeading} />;
      })}
    </>
  );
}
