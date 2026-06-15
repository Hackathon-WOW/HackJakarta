"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Store,
  Wallet,
  Plug,
  FileText,
  Heart,
  ShieldCheck,
  Users,
  LogOut,
  Compass,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV = {
  MSME: [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/dashboard/profile", label: "Business Profile", icon: Store },
    { href: "/dashboard/finance", label: "Finance", icon: Wallet },
    { href: "/dashboard/pos", label: "POS Integration", icon: Plug },
    { href: "/dashboard/documents", label: "Documents", icon: FileText },
    { href: "/dashboard/advisor", label: "AI Advisor", icon: Sparkles },
  ],
  INVESTOR: [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/showcase", label: "Explore Showcase", icon: Compass },
    { href: "/dashboard/pipeline", label: "Interest Pipeline", icon: Heart },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/dashboard/admin/review", label: "MSME Approvals", icon: ShieldCheck },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const links = NAV[user?.role] || [];

  return (
    <aside className="surface-emerald grain sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col text-paper-soft">
      <div className="px-6 py-6">
        <Link href="/">
          <Logo tone="light" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-paper-soft/10 text-paper-soft shadow-soft"
                  : "text-paper-soft/60 hover:bg-paper-soft/5 hover:text-paper-soft",
              )}
            >
              <l.icon className={cn("h-5 w-5", active && "text-amber-300")} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-paper-soft/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-paper-soft/5 p-3">
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-bold text-emerald-900">
            {initials(user?.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-paper-soft">{user?.fullName}</p>
            <p className="text-xs text-paper-soft/50">{user?.role}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="rounded-lg p-1.5 text-paper-soft/60 transition-colors hover:bg-wine/20 hover:text-amber-300"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
