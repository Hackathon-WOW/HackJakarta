import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ProspectRing } from "@/components/ProspectScore";

export function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* brand panel */}
      <div className="surface-emerald grain bg-dots-light relative hidden flex-col justify-between overflow-hidden p-12 text-paper-soft lg:flex">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
        <Link href="/">
          <Logo tone="light" size="lg" />
        </Link>

        <div className="relative">
          <h2 className="text-balance font-display text-4xl font-semibold leading-tight">
            Every great business starts with{" "}
            <span className="italic text-gradient-amber">clean numbers.</span>
          </h2>
          <p className="mt-4 max-w-md text-paper-soft/70">
            Build credible financial reports from your POS or spreadsheets, and find your business match.
          </p>

          <div className="mt-10 flex items-center gap-5 rounded-3xl border border-paper-soft/15 bg-paper-soft/5 p-5 backdrop-blur-xl">
            <div className="[&_*]:!text-paper-soft">
              <ProspectRing score={90} size={92} showLabel={false} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Batik Larasati</p>
              <p className="text-sm text-paper-soft/60">Yogyakarta · Fashion</p>
              <p className="mt-1 text-sm font-semibold text-amber-300">High Prospect · margin 28%</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-paper-soft/40">© {new Date().getFullYear()} Grow · HackJakarta</p>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center bg-paper px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
