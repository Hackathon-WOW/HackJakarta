"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Logo } from "./brand/Logo";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Showcase" },
  { href: "/#how", label: "How It Works" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);

  const onLogout = () => {
    logout();
    setMenu(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sand/70 bg-paper/80 backdrop-blur-xl">
      <nav className="shell flex h-16 items-center justify-between">
        <Link href="/" aria-label="Grow home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-emerald-800",
                pathname === l.href && "text-emerald-800",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-full border border-sand bg-paper-soft py-1.5 pl-1.5 pr-3 transition-colors hover:border-emerald-700/30"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-800 text-xs font-bold text-paper-soft">
                  {initials(user.fullName)}
                </span>
                <span className="max-w-[120px] truncate text-sm font-semibold text-ink">{user.fullName}</span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-sand bg-paper-soft p-1.5 shadow-lift"
                  >
                    <div className="px-3 py-2">
                      <p className="text-xs text-ink-muted">Signed in as</p>
                      <p className="text-sm font-semibold text-emerald-700">{user.role}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-sand/60"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-wine hover:bg-wine/5"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="amber" size="sm">Join Free</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu">
          {mobile ? <X className="h-6 w-6 text-ink" /> : <Menu className="h-6 w-6 text-ink" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-sand/70 md:hidden"
          >
            <div className="shell flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobile(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-sand/60"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                {user ? (
                  <>
                    <Link href="/dashboard" className="flex-1" onClick={() => setMobile(false)}>
                      <Button className="w-full" size="sm">Dashboard</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={onLogout}>Log Out</Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex-1" onClick={() => setMobile(false)}>
                      <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/auth/register" className="flex-1" onClick={() => setMobile(false)}>
                      <Button variant="amber" size="sm" className="w-full">Join</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
