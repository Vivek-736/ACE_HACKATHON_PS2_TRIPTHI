import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { UserSyncProvider } from "@/components/providers/user-sync-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteTitle = "Tripti - Rescue Food. Share Hope.";
const siteDescription =
  "Tripti connects food donors, NGOs, and volunteers to rescue surplus food and deliver it to communities that need it.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${robotoCondensed.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <ClerkProvider>
            <UserSyncProvider>
              <QueryProvider>{children}</QueryProvider>
            </UserSyncProvider>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}