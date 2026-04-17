'use client';

import { useEffect, useState } from 'react';
import { investorApi } from '@/services/api';
import type { MSMEWithHealth } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage, getStatusBadgeColor } from '@/lib/utils';
import Link from 'next/link';
import { Search, TrendingUp, Users, BarChart3 } from 'lucide-react';

export default function InvestorDashboardPage() {
  const [msmes, setMsmes] = useState<MSMEWithHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMSMEs();
  }, []);

  const fetchMSMEs = async () => {
    try {
      const response = await investorApi.discoverMSMEs(1, 6);
      if (response.success && response.data) {
        setMsmes(response.data.msmes);
      }
    } catch (error) {
      console.error('Failed to fetch MSMEs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMSMEs();
      return;
    }

    setIsLoading(true);
    try {
      const response = await investorApi.searchMSMEs(searchQuery);
      if (response.success && response.data) {
        setMsmes(response.data.msmes);
      }
    } catch (error) {
      console.error('Search failed:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Investor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Discover and analyze promising MSMEs</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search MSMEs by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-primary-green-dark hover:bg-primary-green-medium">
              Search
            </Button>
            <Link href="/dashboard/investor/discover">
              <Button variant="outline">Browse All</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified MSMEs
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{msmes.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Performers
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {msmes.filter(m => m.healthIndicators.profitMargin > 20).length}
            </div>
            <p className="text-xs text-muted-foreground">
              With 20%+ profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Growth
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {msmes.filter(m => m.healthIndicators.revenueGrowth > 10).length}
            </div>
            <p className="text-xs text-muted-foreground">
              With 10%+ revenue growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Featured MSMEs */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Featured MSMEs</h2>
          <Link href="/dashboard/investor/discover">
            <Button variant="link" className="text-primary-orange-dark">
              View All →
            </Button>
          </Link>
        </div>

        {msmes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No verified MSMEs available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {msmes.slice(0, 6).map((msme) => (
              <Card key={msme.id} className="overflow-hidden">
                <CardHeader className="bg-primary-green-light">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{msme.companyName}</CardTitle>
                      <CardDescription>{msme.companyCategory || 'General'}</CardDescription>
                    </div>
                    <Badge className={getStatusBadgeColor(msme.verificationStatus)}>
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {msme.description || 'No description available'}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Revenue</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(msme.healthIndicators.averageRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Profit Margin</span>
                      <span className="font-semibold">
                        {msme.healthIndicators.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Revenue Growth</span>
                      <span className={`font-semibold ${
                        msme.healthIndicators.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(msme.healthIndicators.revenueGrowth)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Reports</span>
                      <span className="font-semibold">
                        {msme.healthIndicators.reportCount}
                      </span>
                    </div>
                  </div>

                  <Link href={`/dashboard/investor/msme/${msme.id}`}>
                    <Button className="w-full mt-4 bg-primary-green-dark hover:bg-primary-green-medium">
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
