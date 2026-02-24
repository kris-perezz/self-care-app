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
      { url: "/himo-favicon-light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/himo-favicon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/himo-icon-light.svg",
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
