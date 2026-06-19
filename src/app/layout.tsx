import type { Metadata } from "next";
import { Onest, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContacts } from "@/components/FloatingContacts";
import { CartToast } from "@/components/CartToast";
import { site } from "@/data/site";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — корейская косметика и здоровье`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

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
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <FloatingContacts />
        <CartToast />
      </body>
    </html>
  );
}
