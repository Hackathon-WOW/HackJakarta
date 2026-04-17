'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { investorApi } from '@/services/api';
import type { MSMEWithHealth } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage, getStatusBadgeColor } from '@/lib/utils';
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export default function MSMEShowcasePage() {
  const { isAuthenticated, user } = useAuth();
  const [msmes, setMsmes] = useState<MSMEWithHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMSMEs();
  }, []);

  const fetchMSMEs = async () => {
    try {
      const response = await investorApi.discoverMSMEs(1, 9);
      if (response.success && response.data) {
        setMsmes(response.data.msmes);
      }
    } catch (error) {
      console.error('Failed to fetch MSMEs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary-green-dark border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-orange-light">
      {/* Header */}
      <header className="py-4 text-white bg-primary-green-dark">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link href="/" className="text-xl font-bold">
            MSME Platform
          </Link>
          <nav className="flex gap-8 items-center">
            <Link href="/" className="hover:text-white hover:border-b-2 border-white transition-all">
              Home
            </Link>
            <Link href="/msme-showcase" className="hover:text-white border-b-2 border-white transition-all">
              UMKM Showcase
            </Link>
            {isAuthenticated ? (
              <Link href={`/dashboard/${user?.role?.toLowerCase()}`}>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary-green-dark">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-primary-orange-dark hover:bg-primary-orange-medium">
                  Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-green-dark mb-6">
          Discover Promising UMKM Opportunities
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Explore verified small and medium businesses with transparent financial data.
          Make informed investment decisions backed by AI-powered analytics.
        </p>
        {!isAuthenticated && (
          <Link href="/auth/register">
            <Button size="lg" className="bg-primary-green-dark hover:bg-primary-green-medium">
              Join as Investor
            </Button>
          </Link>
        )}
      </section>

      {/* MSMEs Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Businesses</h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-primary-green-dark text-white flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-primary-green-dark text-white flex items-center justify-center">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {msmes.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No verified MSMEs available at the moment. Check back soon!
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {msmes.map((msme) => (
              <Card key={msme.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-primary-green-light">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{msme.companyName}</CardTitle>
                      <CardDescription>{msme.companyCategory || 'Business'}</CardDescription>
                    </div>
                    <Badge className={getStatusBadgeColor(msme.verificationStatus)}>
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
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
                      <span className="text-sm text-muted-foreground">Growth</span>
                      <span className={`font-semibold flex items-center gap-1 ${
                        msme.healthIndicators.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {msme.healthIndicators.revenueGrowth >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatPercentage(msme.healthIndicators.revenueGrowth)}
                      </span>
                    </div>
                  </div>

                  {isAuthenticated && user?.role === 'INVESTOR' ? (
                    <Link href={`/dashboard/investor/msme/${msme.id}`}>
                      <Button className="w-full mt-4 bg-primary-green-dark hover:bg-primary-green-medium">
                        View Details
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/login">
                      <Button className="w-full mt-4 bg-primary-orange-dark hover:bg-primary-orange-medium">
                        Login to View
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-primary-green-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join our platform and gain access to verified MSMEs with comprehensive financial analytics.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-primary-green-dark hover:bg-gray-100">
                  Create Account
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-green-dark">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-70">© 2024 MSME Investment Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
