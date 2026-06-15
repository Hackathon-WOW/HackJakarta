"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleGate } from "@/components/dashboard/RoleGate";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";

const ROLE_VARIANT = { MSME: "emerald", INVESTOR: "amber", ADMIN: "solid" };

export default function UsersPage() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.admin.users().then((r) => setUsers(r.data)).catch(() => setUsers([]));
  }, []);

  return (
    <RoleGate allow={["ADMIN"]}>
      <PageHeader title="Users" subtitle="All registered accounts on the platform." />

      {users === null ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-4 font-semibold">User</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {users.map((u) => (
                <tr key={u.id} className="bg-paper-soft">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-800 text-xs font-bold text-paper-soft">
                        {initials(u.fullName)}
                      </span>
                      <span className="font-semibold text-ink">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{u.email}</td>
                  <td className="px-5 py-4"><Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge></td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </RoleGate>
  );
}
