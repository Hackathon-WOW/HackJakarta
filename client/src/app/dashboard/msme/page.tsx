'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { msmeApi } from '@/services/api';
import type { MSMEProfile, FinancialReport } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatusBadgeColor } from '@/lib/utils';
import Link from 'next/link';
import { TrendingUp, TrendingDown, FileText, Upload } from 'lucide-react';

export default function MSMEDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MSMEProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await msmeApi.getProfile();
        if (response.success && response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-green-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const reports = profile?.financialReports || [];
  const latestReport = reports[0];
  
  const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);
  const totalProfit = reports.reduce((sum, r) => sum + r.netProfit, 0);
  const avgProfitMargin = reports.length > 0 && totalRevenue > 0 
    ? (totalProfit / totalRevenue) * 100 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MSME Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/msme/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
          <Link href="/dashboard/msme/reports">
            <Button className="bg-primary-green-dark hover:bg-primary-green-medium">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Status */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Business Profile</CardTitle>
            <Badge className={getStatusBadgeColor(profile?.verificationStatus || 'PENDING')}>
              {profile?.verificationStatus || 'PENDING'}
            </Badge>
          </div>
          <CardDescription>
            {profile?.verificationStatus === 'VERIFIED'
              ? 'Your business is verified and visible to investors'
              : profile?.verificationStatus === 'REJECTED'
              ? 'Your verification was rejected. Please update your profile.'
              : 'Your profile is pending verification by admin'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-semibold">{profile.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-semibold">{profile.companyCategory || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year Established</p>
                <p className="font-semibold">{profile.yearEstablished || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{profile.address || 'Not specified'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't created your business profile yet.</p>
              <Link href="/dashboard/msme/profile">
                <Button>Create Profile</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Across {reports.length} reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Net Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Average margin: {avgProfitMargin.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Financial Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              {reports.length > 0 ? `Last: ${formatDate(reports[0].periodEnd)}` : 'No reports yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Report */}
      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Financial Report</CardTitle>
            <CardDescription>{latestReport.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(latestReport.revenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-xl font-semibold text-red-600">
                  {formatCurrency(latestReport.expenses)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(latestReport.netProfit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-semibold">
                  {latestReport.revenue > 0 
                    ? ((latestReport.netProfit / latestReport.revenue) * 100).toFixed(2)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
