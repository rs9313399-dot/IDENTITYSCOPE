import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IdentityScope AI — Discover your digital identity across the internet",
  description:
    "Scan a username, GitHub profile, website, or email and generate a complete Digital Identity Report. GitHub analysis, portfolio scoring, social discovery, AI recommendations — powered by public APIs only.",
  keywords: [
    "digital identity",
    "GitHub analysis",
    "developer portfolio",
    "OSINT",
    "username scanner",
    "IdentityScope AI",
  ],
  authors: [{ name: "IdentityScope AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "IdentityScope AI",
    description: "Discover your digital identity across the internet.",
    siteName: "IdentityScope AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IdentityScope AI",
    description: "Discover your digital identity across the internet.",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
            <SonnerToaster position="bottom-right" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
