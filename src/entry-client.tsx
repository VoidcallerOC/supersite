import { hydrateRoot, createRoot } from "react-dom/client";
import site from "virtual:site";
import { App } from "./App";
import type { PageProps } from "./core/routes";
import "./styles/app.css";
import "virtual:site-styles";

const root = document.getElementById("root")!;
const dataEl = document.getElementById("__page");

if (dataEl) {
  // Prerendered page: attach React to the existing HTML.
  const props = JSON.parse(dataEl.textContent || "{}") as PageProps;
  hydrateRoot(root, <App site={site} props={props} />);
} else if (import.meta.env.DEV) {
  // Dev server only: render client-side from the current URL.
  void import("./dev-render").then(({ devProps, devThemeCss }) => {
    const style = document.createElement("style");
    style.textContent = devThemeCss();
    document.head.append(style);
    void devProps(window.location.pathname).then((props) => createRoot(root).render(<App site={site} props={props} />));
  });
}
