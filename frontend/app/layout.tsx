import Script from "next/script";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Saira_Semi_Condensed, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "sonner";

const displayFont = Cormorant_Garamond({variable:"--font-astren-display",subsets:["latin"],weight:["400","500","600"]});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sairaSemiCondensed = Saira_Semi_Condensed({
  variable: "--font-saira-semi-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coach.florent-huitric.fr'),
  robots: { index: false, follow: false },
  title: "VolleyCoaching - Plateforme tactique",
  description: "Interface tactique professionnelle pour le coaching volleyball",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${geistSans.variable} ${geistMono.variable} ${sairaSemiCondensed.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      <Script id="audience-consent" src="https://florent-huitric.fr/analytics/consent.js" strategy="afterInteractive" data-website="45e84ba3-dc89-43b5-8717-fde57672e3a2" data-domain="coach.florent-huitric.fr" />
      </body>
    </html>
  );
}
