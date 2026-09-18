import OfflineSupport from "./components/OfflineSupport";
import OfflineDownloadButton from "./components/OfflineDownloadButton";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://rcms26.vercel.app"
  ),
  title: {
    default: "Recipe CMS",
    template: "%s | Recipe CMS",
  },
  description: "Discover delicious recipes for every occasion.",
  applicationName: "Recipe CMS",
  manifest: "/site.webmanifest",
  keywords: ["recipes", "cooking", "food", "meal ideas"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <OfflineSupport />
        <OfflineDownloadButton />
        {children}
      </body>
    </html>
  );
}
