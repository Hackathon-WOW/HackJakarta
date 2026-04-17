'use client';

import { useEffect, useState } from 'react';
import { msmeApi } from '@/services/api';
import type { MSMEProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const categoryOptions = [
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

export default function MSMEProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profile, setProfile] = useState<Partial<MSMEProfile>>({
    companyName: '',
    companyCategory: '',
    description: '',
    address: '',
    contactPerson: '',
    yearEstablished: undefined,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await msmeApi.getProfile();
        if (response.success && response.data) {
          setProfile({
            companyName: response.data.companyName,
            companyCategory: response.data.companyCategory || '',
            description: response.data.description || '',
            address: response.data.address || '',
            contactPerson: response.data.contactPerson || '',
            yearEstablished: response.data.yearEstablished,
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'yearEstablished' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isNewProfile = !profile.id;
      const response = isNewProfile
        ? await msmeApi.createProfile(profile)
        : await msmeApi.updateProfile(profile);

      if (response.success) {
        toast.success(response.message);
        router.push('/dashboard/msme');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-green-dark border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            Complete your business profile to get verified and attract investors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={profile.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyCategory">Business Category</Label>
                <Select
                  id="companyCategory"
                  name="companyCategory"
                  value={profile.companyCategory || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, companyCategory: e.target.value }))}
                  options={categoryOptions}
                  placeholder="Select a category"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearEstablished">Year Established</Label>
                <Input
                  id="yearEstablished"
                  name="yearEstablished"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={profile.yearEstablished || ''}
                  onChange={handleChange}
                  placeholder="e.g., 2020"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                name="description"
                value={profile.description}
                onChange={handleChange}
                placeholder="Describe your business, products, and services..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter your business address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={profile.contactPerson}
                onChange={handleChange}
                placeholder="Name of contact person"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="bg-primary-green-dark hover:bg-primary-green-medium">
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
