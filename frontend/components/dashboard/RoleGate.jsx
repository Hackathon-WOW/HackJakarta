"use client";

import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/EmptyState";
import { ShieldAlert } from "lucide-react";

export function RoleGate({ allow, children }) {
  const { user } = useAuth();
  if (!user) return null;
  if (!allow.includes(user.role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="This page isn't for your role"
        description={`This page is only available for: ${allow.join(", ")}.`}
        className="mt-10"
      />
    );
  }
  return children;
}
