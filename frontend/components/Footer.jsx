import Link from "next/link";
import { Logo } from "./brand/Logo";

export function Footer() {
  return (
    <footer className="surface-emerald grain bg-dots-light text-paper-soft/80">
      <div className="shell grid gap-10 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper-soft/70">
            Bridging Indonesian MSMEs with investors through clean, transparent,
            investor-ready financial reports.
          </p>
        </div>
        <div>
          <h4 className="font-display text-base font-semibold text-paper-soft">Platform</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/showcase" className="hover:text-amber-300">MSME Showcase</Link></li>
            <li><Link href="/auth/register" className="hover:text-amber-300">Join as MSME</Link></li>
            <li><Link href="/auth/register" className="hover:text-amber-300">Join as Investor</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-base font-semibold text-paper-soft">POS Integrations</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-paper-soft/70">
            <li>Moka POS</li>
            <li>Pawoon</li>
            <li>majoo</li>
            <li>GoBiz (GoFood)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper-soft/10">
        <div className="shell flex flex-col items-center justify-between gap-2 py-6 text-xs text-paper-soft/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Grow. Built for Indonesian MSMEs.</p>
          <p>HackJakarta · Connecting MSME with Investors</p>
        </div>
      </div>
    </footer>
  );
}
