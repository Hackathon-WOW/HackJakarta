"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
