import type { SiteConfig } from "./core/schema";
import { routeMeta, type PageProps } from "./core/routes";
import { SiteProvider } from "./components/site-context";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { DemoBanner } from "./components/DemoBanner";
import { SectionList } from "./pages/SectionList";
import { PageHeader } from "./pages/PageHeader";
import { EventPage, NotFoundPage, PostPage, ProductPage } from "./pages/DetailPages";

export function App({ site, props }: { site: SiteConfig; props: PageProps }) {
  const { route, catalog } = props;
  const meta = routeMeta(site, route);
  return (
    <SiteProvider value={site}>
      <div className="flex min-h-dvh flex-col">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <DemoBanner />
        <Header currentPath={route.path} />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {route.kind === "page" ? (
            <>
              {route.page.heading ? <PageHeader heading={route.page.heading} crumbs={meta.breadcrumbs} /> : null}
              <SectionList sections={route.page.sections} catalog={catalog} hasPageHeading={Boolean(route.page.heading)} />
            </>
          ) : null}
          {route.kind === "product" ? <ProductPage product={route.product} crumbs={meta.breadcrumbs} /> : null}
          {route.kind === "event" ? <EventPage event={route.event} crumbs={meta.breadcrumbs} /> : null}
          {route.kind === "post" ? <PostPage post={route.post} crumbs={meta.breadcrumbs} /> : null}
          {route.kind === "not-found" ? <NotFoundPage /> : null}
        </main>
        <Footer />
      </div>
    </SiteProvider>
  );
}
