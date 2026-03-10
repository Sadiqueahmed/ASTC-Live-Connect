import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ASTC Live Connect - Smart Public Transport Sync",
  description: "Real-time bus tracking, traffic-aware ETA predictions, and community-powered transport sync for Guwahati's ASTC buses.",
  keywords: ["ASTC", "Guwahati", "Bus Tracking", "Public Transport", "ETA", "Real-time", "Assam"],
  authors: [{ name: "ASTC Live Connect" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2'><path d='M8 6v6m8-6v6M4 9h16M6 21h12a2 2 0 0 0 2-2v-4H4v4a2 2 0 0 0 2 2z'/><circle cx='7' cy='18' r='1.5'/><circle cx='17' cy='18' r='1.5'/></svg>",
  },
  openGraph: {
    title: "ASTC Live Connect",
    description: "Smart Public Transport Sync for Guwahati",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Sonner position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
