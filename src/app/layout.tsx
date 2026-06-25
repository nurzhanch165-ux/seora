import type { Metadata } from "next";
import { Onest, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CartToast } from "@/components/CartToast";
import { ExchangeRatesLoader } from "@/components/ExchangeRatesLoader";
import { LocaleSync } from "@/components/LocaleSync";
import { CustomerSessionLoader } from "@/components/CustomerSessionLoader";
import { site } from "@/data/site";
import { t } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/siteUrl";
import { getRequestLocale } from "@/lib/locale.server";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = getRequestLocale();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: t("site.defaultTitle", locale, { name: site.name }),
      template: `%s · ${site.name}`,
    },
    description: t("site.description", locale),
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${manrope.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-pearl antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <Header />
        <main className="flex min-h-[60vh] flex-col">
          <div className="min-w-0 flex-1">{children}</div>
          <MobileBottomNav />
        </main>
        <Footer />
        <ScrollToTop />
        <CartToast />
        <ExchangeRatesLoader />
        <LocaleSync />
        <CustomerSessionLoader />
      </body>
    </html>
  );
}
