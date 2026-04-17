'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-green-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: `/dashboard/${user.role.toLowerCase()}`, label: 'Dashboard', roles: ['ADMIN', 'MSME', 'INVESTOR'] },
    { href: '/dashboard/msme/profile', label: 'Profile', roles: ['MSME'] },
    { href: '/dashboard/msme/reports', label: 'Financial Reports', roles: ['MSME'] },
    { href: '/dashboard/investor/discover', label: 'Discover MSMEs', roles: ['INVESTOR'] },
    { href: '/dashboard/admin/users', label: 'Users', roles: ['ADMIN'] },
    { href: '/dashboard/admin/verifications', label: 'Verifications', roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary-green-dark">
              MSME Platform
            </Link>
            <nav className="hidden md:flex gap-6">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    "text-muted-foreground hover:text-primary-green-dark"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <span className={cn(
                "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                user.role === 'ADMIN' && "bg-purple-100 text-purple-800",
                user.role === 'MSME' && "bg-blue-100 text-blue-800",
                user.role === 'INVESTOR' && "bg-green-100 text-green-800"
              )}>
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-muted-foreground hover:text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
