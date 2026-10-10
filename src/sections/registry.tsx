import type { ComponentType } from "react";
import type { SectionType } from "../core/schema";
import type { SectionProps } from "./types";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Steps } from "./Steps";
import { Testimonials } from "./Testimonials";
import { CtaBand } from "./CtaBand";
import { Faq } from "./Faq";
import { Contact } from "./Contact";
import { HoursLocation } from "./HoursLocation";
import { Catalog } from "./Catalog";
import { Events } from "./Events";
import { Pricing } from "./Pricing";
import { RichText } from "./RichText";
import { Posts } from "./Posts";

/**
 * Section type -> component. The mapped type makes TypeScript fail the build
 * if a section type in the schema has no component here.
 */
export const SECTIONS: { [K in SectionType]: ComponentType<SectionProps<K>> } = {
  hero: Hero,
  features: Features,
  steps: Steps,
  testimonials: Testimonials,
  "cta-band": CtaBand,
  faq: Faq,
  contact: Contact,
  "hours-location": HoursLocation,
  catalog: Catalog,
  events: Events,
  pricing: Pricing,
  "rich-text": RichText,
  posts: Posts,
};
