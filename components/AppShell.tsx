"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Bookmark, PackageCheck } from "lucide-react";
import { useProductStore } from "@/store/product.store";
import { ROUTES } from "@/lib/config";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { t } from "@/lib/i18n";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  count: number;
};

const AppShell = ({
  children,
  activeNavId: activeNavIdProp,
}: {
  children: React.ReactNode;
  activeNavId?: string;
}) => {
  const pathname = usePathname();
  const products = useProductStore((s) => s.products);

  const inboxCount = products.filter((p) => !p.shelf || p.shelf === "inbox").length;
  const archivedCount = products.filter((p) => p.shelf === "archived").length;
  const boughtCount = products.filter((p) => p.shelf === "purchased").length;

  const navItems: NavItem[] = [
    { id: "inbox", label: "담다", href: ROUTES.HOME, icon: <Inbox size={15} />, count: inboxCount },
    { id: "archived", label: "보관함", href: ROUTES.SHELF, icon: <Bookmark size={15} />, count: archivedCount },
    { id: "bought", label: "구매 완료", href: `${ROUTES.SHELF}?tab=purchased`, icon: <PackageCheck size={15} />, count: boughtCount },
  ];

  const activeId = (() => {
    if (pathname === "/") return "inbox";
    if (pathname.startsWith("/shelf")) return "shelf";
    return "";
  })();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">

      {/* ════════════════ 전폭 글로벌 헤더 ════════════════ */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-5">
          {/* 로고 — 누르면 / 로 이동 */}
          <Link
            href={ROUTES.HOME}
            className="text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={t("app.name")}
          >
            {t("app.name")}
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ════════════════ 헤더 아래: 사이드바 + 콘텐츠 ════════════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ─── 데스크탑 사이드바 ─── */}
        <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-border bg-surface">
          <nav className="flex-1 px-3 pt-6 pb-4" aria-label="메인 네비게이션">
            <p className="mb-3 px-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
              내 목록
            </p>
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const resolvedActiveId = activeNavIdProp ?? activeId;
                const isActive = item.id === resolvedActiveId;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3.5 py-3",
                        "text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-foreground-muted hover:bg-card hover:text-foreground",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="flex items-center gap-2.5">
                        {item.icon}
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "min-w-[20px] text-center text-xs font-semibold tabular-nums",
                          isActive ? "text-background/70" : "text-foreground-subtle",
                        )}
                      >
                        {item.count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* ─── 메인 콘텐츠 ─── */}
        <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppShell;
