import { Html, Head, Main, NextScript } from "next/document";
import laravelURL from "../components/utils/laravel-url";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="shortcut icon"
          href="/assets/signaturecare-mini.webp"
          type="image/webp"
        />
        {/* Preconnect - Critical third-party resources */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href={laravelURL} />
        <link rel="preconnect" href="https://tag.brandcdn.com" />
        <link rel="preconnect" href="https://www.clickcease.com" />
        <link rel="preconnect" href="https://translate.google.com" />

        {/* DNS Prefetch - For deferred resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://webchat.ercare24.com" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
