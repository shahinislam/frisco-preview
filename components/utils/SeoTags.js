import Head from "next/head";
import mainURL from "./main-url";

const SUPPORTED_LOCALES = [
  "en",
  "es",
  "ur",
  "hi",
  "ar",
  "ml",
  "vi",
  "ig",
  "yo",
  "bn",
];

const DEFAULT_LOCALE = "en";

// Emits <link rel="canonical"> + per-locale <link rel="alternate" hreflang>.
// The `path` prop is the un-prefixed URL path (e.g., "/contact-us").
// Canonical always points to the default-locale URL.
// hreflang entries are emitted for every supported locale; Google ignores
// alternates that resolve to noindex'd pages, so they're dormant until a
// page gets real translated content (and its noindex is lifted).
export default function SeoTags({ path = "/" }) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const canonical = `${mainURL}${normalized}`;

  return (
    <Head>
      <link rel="canonical" href={canonical} key="canonical" />
      {SUPPORTED_LOCALES.map((locale) => {
        const href =
          locale === DEFAULT_LOCALE
            ? canonical
            : `${mainURL}/${locale}${normalized}`;
        return (
          <link
            key={`hreflang-${locale}`}
            rel="alternate"
            hrefLang={locale}
            href={href}
          />
        );
      })}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={canonical}
        key="hreflang-x-default"
      />
    </Head>
  );
}
