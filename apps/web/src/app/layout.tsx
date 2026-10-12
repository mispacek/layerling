import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NewVersionNotice } from "@/components/NewVersionNotice";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { DOM_MUTATION_GUARD_SCRIPT } from "@/lib/domMutationGuard";
import { TOOLBAR_SIZE_BOOT_SCRIPT } from "@/lib/toolbarSize";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";
import { GRAPHITE_STYLESHEET_HREF, GRAPHITE_STYLESHEET_ID } from "@/lib/appTheme";

const NAME = "layerling";
const TITLE = "layerling – bezplatné 3D modelování pro 3D tisk v prohlížeči";
const DESCRIPTION = "Bezplatný 3D CAD v prohlížeči bez účtu: alternativa k Tinkercadu se zaoblením, zkosením, dutinami a závity. Export do STL, 3MF a STEP.";

// Tells search engines what layerling is: a free web application, not an
// article about one.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: NAME,
  url: "https://3d.espide.eu/",
  description: DESCRIPTION,
  applicationCategory: "DesignApplication",
  operatingSystem: "Any (web browser)",
  inLanguage: ["en", "de", "cs"],
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  image: "https://3d.espide.eu/assets/layerling/layerling-social.png",
  sameAs: ["https://github.com/henmedia/layerling"],
};
const SOCIAL_CARD = "/assets/layerling/layerling-social.png";

// Chrome and Edge announce "this can be installed" once, often before React is
// running. The event is kept for the start page's install button
// (InstallAppHint); preventDefault only stops the small bar on phones.
const INSTALL_PROMPT_SCRIPT = `window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__layerlingInstallPrompt=e;window.dispatchEvent(new Event("layerling-install-prompt"))});window.addEventListener("appinstalled",function(){window.__layerlingInstallPrompt=null;window.dispatchEvent(new Event("layerling-install-prompt"))});`;

export const metadata: Metadata = {
  // Damit die Bilder fuer Linkvorschauen als volle Adresse im Kopf stehen -
  // relative Angaben liest kein Forum und kein Messenger aus.
  metadataBase: new URL("https://3d.espide.eu"),
  alternates: { canonical: "/" },
  title: TITLE,
  description: DESCRIPTION,
  applicationName: NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    // Das SVG ist das eigentliche Symbol; die .ico steht daneben fuer alles,
    // was stur /favicon.ico abholt, statt in den Kopf zu sehen.
    icon: [
      { url: "/assets/layerling/layerling-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    // iOS nimmt hier ausschliesslich PNG. Stand da ein SVG, legte
    // "Zum Home-Bildschirm" einen Schnappschuss der Seite ab statt des Symbols.
    apple: { url: "/assets/layerling/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    type: "website",
    siteName: NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "cs_CZ",
    images: [{ url: SOCIAL_CARD, width: 1280, height: 640, type: "image/png", alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SOCIAL_CARD],
  },
};

export const viewport: Viewport = {
  // Faerbt die Leiste des Browsers und, wenn layerling als App laeuft, deren
  // Titelzeile. Die Werte sind die der Werkzeugleiste, hell wie dunkel.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#2b2116" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Translate tools add classes such as translated-ltr to <html>; that must not end in a hydration error (#191).
    <html lang={DEFAULT_LANGUAGE} data-theme="dark" data-palette="graphite" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <link id={GRAPHITE_STYLESHEET_ID} rel="stylesheet" href={GRAPHITE_STYLESHEET_HREF} />
        {/* Before any of React's scripts: a page rearranged by Translate must not crash it (#186). */}
        <script dangerouslySetInnerHTML={{ __html: DOM_MUTATION_GUARD_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: TOOLBAR_SIZE_BOOT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: INSTALL_PROMPT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
        {children}
        <ServiceWorkerRegistration />
        <NewVersionNotice />
      </body>
    </html>
  );
}
