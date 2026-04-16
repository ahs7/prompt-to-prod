import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Prompt-to-Prod — Website Readiness Auditor",
    template: "%s | Prompt-to-Prod",
  },
  description:
    "Paste your URL. Find out why your product isn't converting, retaining, or scaling — and exactly what to fix first.",
  keywords: [
    "product audit",
    "website audit",
    "conversion rate optimization",
    "startup readiness",
    "SaaS audit",
    "website analysis",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Prompt-to-Prod",
    title: "Prompt-to-Prod — Website Readiness Auditor",
    description:
      "Find out why your product isn't converting — and exactly what to fix first.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt-to-Prod",
    description:
      "Find out why your product isn't converting — and exactly what to fix first.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-navy-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
