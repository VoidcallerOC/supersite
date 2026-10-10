import type { ReactNode } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import type { Crumb } from "../core/routes";

export function PageHeader({ heading, crumbs, children }: { heading: string; crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <div className="tone-alt border-b border-border">
      <div className="container-site py-10 sm:py-14">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-4">{heading}</h1>
        {children}
      </div>
    </div>
  );
}
