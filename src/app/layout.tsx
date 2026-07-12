import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AccentColorProvider } from "@/components/accent-color-provider";
import { Analytics } from "@vercel/analytics/next";
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IDENTITYSCOPE AI // DIGITAL IDENTITY SCANNER",
  description:
    "Scan a username, GitHub profile, website, or email and generate a complete Digital Identity Report. Powered by public APIs only. Privacy-first.",
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
  // Lock Dark Reader — our app already controls contrast heavily. This prevents the
  // browser extension from injecting data-darkreader-* attributes into SVGs
  // which causes React hydration mismatches.
  other: {
    "darkreader-lock": "",
  },
  openGraph: {
    title: "IDENTITYSCOPE AI",
    description: "Discover your digital identity across the internet.",
    siteName: "IdentityScope AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IDENTITYSCOPE AI",
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
      <head>
        {/* Lock Dark Reader — our app already controls contrast heavily. Prevents the
            extension from injecting data-darkreader-* attributes into SVGs
            which causes React hydration mismatches. */}
        <meta name="darkreader-lock" content="" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AccentColorProvider>
              {children}
            </AccentColorProvider>
            <Toaster />
            <SonnerToaster position="top-right" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
	<Analytics />
      </body>
    </html>
  );
}
