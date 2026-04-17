'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import type { DashboardStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Building2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-green-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage users and verify MSME profiles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                {stats?.roleDistribution.ADMIN || 0} Admin
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {stats?.roleDistribution.MSME || 0} MSME
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                {stats?.roleDistribution.INVESTOR || 0} Investor
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified MSMEs</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMSMEs || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingVerifications || 0}</div>
            <Link href="/dashboard/admin/verifications" className="text-xs text-primary-orange-dark hover:underline mt-2 block">
              Review now →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Financial submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <CardDescription>
              Review and verify pending MSME applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.pendingVerifications === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">All caught up! No pending verifications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-4xl font-bold text-primary-orange-dark">
                  {stats?.pendingVerifications}
                </p>
                <p className="text-muted-foreground">MSMEs waiting for verification</p>
                <Link href="/dashboard/admin/verifications">
                  <button className="w-full py-2 bg-primary-orange-dark text-white rounded-lg hover:bg-primary-orange-medium transition-colors">
                    Review Applications
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage platform users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Total Users</p>
                  <p className="text-sm text-muted-foreground">All registered users</p>
                </div>
                <span className="text-xl font-bold">{stats?.totalUsers}</span>
              </div>
              <Link href="/dashboard/admin/users">
                <button className="w-full py-2 bg-primary-green-dark text-white rounded-lg hover:bg-primary-green-medium transition-colors">
                  Manage Users
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
