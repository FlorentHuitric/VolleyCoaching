import type { Metadata } from "next";
import { Geist, Geist_Mono, Saira_Semi_Condensed } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "sonner";

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
  title: "VolleyCoaching - Plateforme tactique",
  description: "Interface tactique professionnelle pour le coaching volleyball",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sairaSemiCondensed.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
