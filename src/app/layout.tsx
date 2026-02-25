import type { Metadata } from "next";
import { Fraunces, Epilogue } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "himo",
  description: "Track your self-care goals, reflect, and earn rewards",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/himo-favicon-light.svg?v=2", media: "(prefers-color-scheme: light)", type: "image/svg+xml" },
      { url: "/himo-favicon-dark.svg?v=2", media: "(prefers-color-scheme: dark)", type: "image/svg+xml" },
      { url: "/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "himo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${epilogue.variable} antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
