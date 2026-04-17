'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import type { MSMEProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, getStatusBadgeColor } from '@/lib/utils';
import { Check, X, ChevronLeft, ChevronRight, FileText, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminVerificationsPage() {
  const [profiles, setProfiles] = useState<MSMEProfile[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingVerifications();
  }, [pagination.page]);

  const fetchPendingVerifications = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getPendingVerifications(pagination.page, pagination.limit);
      if (response.success && response.data) {
        setProfiles(response.data.msmes);
        setPagination(prev => ({ ...prev, ...response.data!.pagination }));
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      const response = await adminApi.verifyMSME(id, status);
      if (response.success) {
        toast.success(`MSME ${status.toLowerCase()} successfully`);
        fetchPendingVerifications();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update verification status');
    } finally {
      setProcessingId(null);
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
        <h1 className="text-3xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and verify MSME applications
        </p>
      </div>

      {/* Pending Count */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-sm text-muted-foreground">Pending Verifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification List */}
      <div className="space-y-4">
        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No pending verifications at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-green-light rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-green-dark" />
                    </div>
                    <div>
                      <CardTitle>{profile.companyName}</CardTitle>
                      <CardDescription>
                        Owner: {profile.owner?.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeColor(profile.verificationStatus)}>
                    {profile.verificationStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{profile.companyCategory || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year Established</p>
                    <p className="font-medium">{profile.yearEstablished || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{profile.address || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applied</p>
                    <p className="font-medium">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>

                {profile.description && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{profile.description}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={() => handleVerify(profile.id, 'VERIFIED')}
                    disabled={processingId === profile.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {processingId === profile.id ? 'Processing...' : 'Verify'}
                  </Button>
                  <Button
                    onClick={() => handleVerify(profile.id, 'REJECTED')}
                    disabled={processingId === profile.id}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
