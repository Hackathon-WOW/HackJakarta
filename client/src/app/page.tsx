'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-primary-green-dark">
      {/* Header */}
      <header className="py-4 text-white">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link href="/">
            <div className="h-[60px] w-[200px] bg-white/10 rounded flex items-center justify-center font-bold text-xl">
              MSME Platform
            </div>
          </Link>
          <nav className="flex gap-8 items-center">
            <Link href="/msme-showcase" className="hover:text-white hover:border-b-2 border-white transition-all">
              UMKM Showcase
            </Link>
            {isAuthenticated ? (
              <>
                <Link href={`/dashboard/${user?.role?.toLowerCase()}`} className="hover:text-white hover:border-b-2 border-white transition-all">
                  Dashboard
                </Link>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary-green-dark" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="secondary" className="bg-primary-orange-dark hover:bg-primary-orange-medium text-white">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Connect Investors with<br />
          <span className="text-primary-orange-dark">Promising MSMEs</span>
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Transform unstructured financial documents into actionable insights.
          Our AI-powered platform helps you discover, analyze, and invest in high-growth businesses.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="bg-primary-orange-dark hover:bg-primary-orange-medium">
              Get Started
            </Button>
          </Link>
          <Link href="/msme-showcase">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-green-dark">
              Explore MSMEs
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary-green-dark">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-primary-green-light rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Transform financial documents into structured data with our advanced AI extraction technology.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-primary-orange-light rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Financial Insights</h3>
              <p className="text-muted-foreground">
                Access comprehensive financial analytics and trends to make informed investment decisions.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Businesses</h3>
              <p className="text-muted-foreground">
                All MSMEs are verified by our admin team, ensuring transparency and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-green-dark text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-80">© 2024 MSME Investment Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
