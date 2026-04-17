'use client';

import { useEffect, useState } from 'react';
import { investorApi } from '@/services/api';
import type { MSMEWithHealth } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatCurrency, formatPercentage, getStatusBadgeColor } from '@/lib/utils';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'agriculture', label: 'Agriculture & Farming' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail & Trading' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'services', label: 'Services' },
  { value: 'technology', label: 'Technology & IT' },
  { value: 'handcraft', label: 'Handcraft & Art' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'construction', label: 'Construction' },
  { value: 'other', label: 'Other' },
];

export default function DiscoverMSMEsPage() {
  const [msmes, setMsmes] = useState<MSMEWithHealth[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchMSMEs();
  }, [pagination.page, category]);

  const fetchMSMEs = async () => {
    setIsLoading(true);
    try {
      const response = category
        ? await investorApi.discoverMSMEs(pagination.page, pagination.limit, category)
        : await investorApi.discoverMSMEs(pagination.page, pagination.limit);
      
      if (response.success && response.data) {
        setMsmes(response.data.msmes);
        setPagination(prev => ({ ...prev, ...response.data!.pagination }));
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
      const response = await investorApi.searchMSMEs(searchQuery, {
        category: category || undefined,
        page: 1,
        limit: pagination.limit,
      });
      if (response.success && response.data) {
        setMsmes(response.data.msmes);
        setPagination(prev => ({ ...prev, ...response.data!.pagination }));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPagination(prev => ({ ...prev, page: 1 }));
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
        <h1 className="text-3xl font-bold text-gray-900">Discover MSMEs</h1>
        <p className="text-muted-foreground mt-1">Browse and analyze verified businesses</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              options={categoryOptions}
            />
            <Button onClick={handleSearch} className="bg-primary-green-dark hover:bg-primary-green-medium">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {msmes.map((msme) => (
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

              <div className="space-y-2">
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

      {msmes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No MSMEs found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
