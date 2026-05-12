"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Inbox, Bookmark, PackageCheck } from "lucide-react";
import { useProductStore } from "@/store/product.store";
import { ROUTES } from "@/lib/config";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { t } from "@/lib/i18n";
import { AppBridge } from "@/bridge/app.bridge";

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
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    // SSR-safe browser env detection — one-time state initialization after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsApp(AppBridge.isFlutterWebView());
  }, []);

  const inboxCount = products.filter((p) => !p.shelf || p.shelf === "inbox").length;
  const archivedCount = products.filter((p) => p.shelf === "archived").length;
  const boughtCount = products.filter((p) => p.shelf === "purchased").length;

  const navItems: NavItem[] = [
    { id: "inbox",    label: t("nav.inbox"),    href: ROUTES.HOME,                     icon: <Inbox       size={18} />, count: inboxCount    },
    { id: "archived", label: t("nav.archived"), href: ROUTES.SHELF,                    icon: <Bookmark    size={18} />, count: archivedCount },
    { id: "bought",   label: t("nav.bought"),   href: `${ROUTES.SHELF}?tab=purchased`, icon: <PackageCheck size={18} />, count: boughtCount   },
  ];

  const activeId = (() => {
    if (pathname === "/") return "inbox";
    if (pathname.startsWith("/shelf")) return "archived";
    return "";
  })();

  const resolvedActiveId = activeNavIdProp ?? activeId;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">

      {/* ════════════ 글로벌 헤더 ════════════ */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-5">
          <Link
            href={ROUTES.HOME}
            className="text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={t("app.name")}
          >
            {t("app.name")}
          </Link>
          <div className="flex items-center gap-1">
            {/* 앱 모드: 헤더에 네비게이션 아이콘 표시 */}
            {isApp && (
              <nav
                className="flex items-center"
                aria-label="메인 네비게이션"
              >
                {navItems.map((item) => {
                  const isActive = item.id === resolvedActiveId;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`${item.label} ${item.count}개`}
                      className={cn(
                        "relative flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                        isActive
                          ? "text-primary"
                          : "text-foreground-muted hover:bg-foreground/[0.06] hover:text-foreground",
                      )}
                    >
                      {item.icon}
                      {item.count > 0 && (
                        <span
                          className={cn(
                            "absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full px-1 text-center text-[10px] font-bold tabular-nums leading-4",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-foreground text-background",
                          )}
                          aria-hidden="true"
                        >
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ════════════ 헤더 아래: 사이드바 + 콘텐츠 ════════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ─── PC 전용 사이드바 (앱 모드에서는 완전히 숨김) ─── */}
        {!isApp && (
          <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-border bg-surface">
            <nav className="flex-1 px-3 pt-6 pb-4" aria-label="메인 네비게이션">
              <p className="mb-3 px-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                내 목록
              </p>
              <ul className="space-y-0.5">
                {navItems.map((item) => {
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
                            : "text-foreground-muted hover:bg-foreground/[0.07] hover:text-foreground",
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
        )}

        {/* ─── 메인 콘텐츠 ─── */}
        <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppShell;
