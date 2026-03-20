import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quiltographer — Upload a Pattern. Understand Every Step.",
  description:
    "The AI-powered pattern reader for quilters. Upload any PDF quilt pattern, get clear step-by-step instructions, and ask AI when you're confused. Built by Humanity & AI.",
  keywords: [
    "quilt pattern reader",
    "quilting app",
    "PDF pattern reader",
    "quilting instructions",
    "AI quilting helper",
    "quilt pattern organizer",
  ],
  authors: [{ name: "Humanity & AI LLC", url: "https://humanityandai.com" }],
  openGraph: {
    title: "Quiltographer — Upload a Pattern. Understand Every Step.",
    description:
      "The AI-powered pattern reader for quilters. Upload any PDF, get clear step-by-step guidance, ask AI when confused.",
    url: "https://quiltographer.humanityandai.com",
    siteName: "Quiltographer",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiltographer — Upload a Pattern. Understand Every Step.",
    description:
      "The AI-powered pattern reader for quilters. Clear steps. AI help. Built for the tablet next to your sewing machine.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#264653" />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
