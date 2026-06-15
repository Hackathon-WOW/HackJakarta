"use client";

import { useAuth } from "@/lib/auth-context";
import { MsmeDashboard } from "@/components/dashboard/MsmeDashboard";
import { InvestorDashboard } from "@/components/dashboard/InvestorDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "INVESTOR") return <InvestorDashboard user={user} />;
  if (user.role === "ADMIN") return <AdminDashboard user={user} />;
  return <MsmeDashboard user={user} />;
}
