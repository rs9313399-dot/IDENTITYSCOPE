import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AccentColorProvider } from "@/components/accent-color-provider";

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
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
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
      </body>
    </html>
  );
}
