import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/providers/AppShell";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vedic Astrology Platform",
  description: "Professional Vedic astrology charts, dashas, and analysis.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
