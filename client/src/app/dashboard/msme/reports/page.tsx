'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { msmeApi } from '@/services/api';
import type { FinancialReport, ExtractedFinancialData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function MSMEReportsPage() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<{
    extractedData: ExtractedFinancialData;
    report: Partial<FinancialReport>;
  } | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await msmeApi.getProfile();
      if (response.success && response.data) {
        setReports(response.data.financialReports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await msmeApi.uploadDocument(file);
      if (response.success && response.data) {
        const { extractedData, financialReport } = response.data;
        setReviewData({
          extractedData,
          report: financialReport,
        });
        setShowReviewModal(true);
        toast.success('Document processed! Please review the extracted data.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process document');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const data = {
        revenue: parseFloat(formData.get('revenue') as string),
        expenses: parseFloat(formData.get('expenses') as string),
        netProfit: parseFloat(formData.get('netProfit') as string),
        period: formData.get('period') as string,
        periodStart: formData.get('periodStart') as string,
        periodEnd: formData.get('periodEnd') as string,
      };

      const response = await msmeApi.submitReport(data);
      if (response.success) {
        toast.success('Report submitted successfully');
        fetchReports();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit report');
    }
  };

  const handleConfirmReport = async () => {
    if (!reviewData) return;

    try {
      const response = await msmeApi.submitReport({
        revenue: reviewData.extractedData.revenue,
        expenses: reviewData.extractedData.expenses,
        netProfit: reviewData.extractedData.netProfit,
        period: reviewData.extractedData.period,
        periodStart: reviewData.extractedData.periodStart,
        periodEnd: reviewData.extractedData.periodEnd,
      });

      if (response.success) {
        toast.success('Financial report confirmed and saved!');
        setShowReviewModal(false);
        setReviewData(null);
        fetchReports();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await msmeApi.deleteReport(id);
      if (response.success) {
        toast.success('Report deleted');
        fetchReports();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete report');
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
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-muted-foreground mt-1">Upload documents or enter data manually</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Financial Document</CardTitle>
          <CardDescription>
            Upload a PDF or image of your financial statement. Our AI will extract the data automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-green-dark bg-primary-green-light'
                : 'border-gray-300 hover:border-primary-green-medium'
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary-green-dark border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Processing document...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports PDF, PNG, JPG, GIF, WebP (max 10MB)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle>Or Enter Data Manually</CardTitle>
          <CardDescription>Fill in the form below to add a financial report</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="period">Period (e.g., Q1 2024)</Label>
              <Input id="period" name="period" placeholder="Q1 2024" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue">Total Revenue</Label>
              <Input id="revenue" name="revenue" type="number" min="0" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Total Expenses</Label>
              <Input id="expenses" name="expenses" type="number" min="0" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="netProfit">Net Profit</Label>
              <Input id="netProfit" name="netProfit" type="number" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodStart">Period Start Date</Label>
              <Input id="periodStart" name="periodStart" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Period End Date</Label>
              <Input id="periodEnd" name="periodEnd" type="date" required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-primary-green-dark hover:bg-primary-green-medium">
                Submit Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Your submitted financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-green-light rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-green-dark" />
                    </div>
                    <div>
                      <p className="font-medium">{report.period}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(report.periodEnd)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-medium text-green-600">{formatCurrency(report.revenue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Net Profit</p>
                      <p className="font-medium">{formatCurrency(report.netProfit)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {showReviewModal && reviewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-orange-dark" />
                <CardTitle>Review Extracted Data</CardTitle>
              </div>
              <CardDescription>
                Please verify the AI-extracted data before saving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  The data below was automatically extracted using AI. Please verify all values are correct before confirming.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Period</p>
                  <Input
                    value={reviewData.extractedData.period}
                    onChange={(e) => setReviewData(prev => prev ? {
                      ...prev,
                      extractedData: { ...prev.extractedData, period: e.target.value }
                    } : null)}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <Input
                    type="number"
                    value={reviewData.extractedData.revenue}
                    onChange={(e) => setReviewData(prev => prev ? {
                      ...prev,
                      extractedData: { ...prev.extractedData, revenue: parseFloat(e.target.value) || 0 }
                    } : null)}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <Input
                    type="number"
                    value={reviewData.extractedData.expenses}
                    onChange={(e) => setReviewData(prev => prev ? {
                      ...prev,
                      extractedData: { ...prev.extractedData, expenses: parseFloat(e.target.value) || 0 }
                    } : null)}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <Input
                    type="number"
                    value={reviewData.extractedData.netProfit}
                    onChange={(e) => setReviewData(prev => prev ? {
                      ...prev,
                      extractedData: { ...prev.extractedData, netProfit: parseFloat(e.target.value) || 0 }
                    } : null)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleConfirmReport}
                  className="flex-1 bg-primary-green-dark hover:bg-primary-green-medium"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm & Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewData(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
