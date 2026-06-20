"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { I18nProvider, useI18n } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <LocalizedShell>{children}</LocalizedShell>
    </I18nProvider>
  );
}

function LocalizedShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(247,215,116,0.12),_transparent_35%),#08080f]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-amber-100">
            {t("ui.navHome")}
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <Link href="/birth-details" className="hover:text-amber-100">
              {t("ui.navBirthDetails")}
            </Link>
            <Link href="/kundali" className="hover:text-amber-100">
              {t("ui.navKundali")}
            </Link>
            <Link href="/varshphal" className="hover:text-amber-100">
              {t("ui.navVarshphal")}
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
