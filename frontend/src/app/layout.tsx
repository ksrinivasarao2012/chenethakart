import type { Metadata, Viewport } from "next";
import Providers from "@/context/Providers";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const DESCRIPTION =
  "Quality-checked crochet and handloom crafts from independent Indian artisans. Handmade Stories, Brighter Tomorrows.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Chenethakart — Unique Handmade Treasures", template: "%s · Chenethakart" },
  description: DESCRIPTION,
  applicationName: "Chenethakart",
  icons: { icon: "/logo-mark.svg" },
  openGraph: { type: "website", siteName: "Chenethakart", title: "Chenethakart — Unique Handmade Treasures", description: DESCRIPTION, locale: "en_IN" },
  twitter: { card: "summary_large_image", title: "Chenethakart — Unique Handmade Treasures", description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#FAF7F0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-terracotta focus:px-4 focus:py-2 focus:text-white">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
