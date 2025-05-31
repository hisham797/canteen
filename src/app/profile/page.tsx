'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, User, Mail, Phone, Building, Settings, LogOut, Key } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import PasskeyOverlay from '@/components/admin/PasskeyOverlay';

interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
  campus: string;
  role: 'admin';
  department: string;
  isActive: boolean;
}

const AdminProfile = () => {
  const [admin, setAdmin] = useState<AdminProfile>({
    fullName: 'Admin User',
    email: 'admin@example.com',
    phone: '+1234567890',
    campus: 'Main Campus',
    role: 'admin',
    department: 'Administration',
    isActive: true
  });
  const [isPasskeyOverlayOpen, setIsPasskeyOverlayOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.role === 'admin') {
            setAdmin({
              fullName: userData.fullName || 'Admin User',
              email: userData.email || 'admin@example.com',
              phone: userData.phone || '+1234567890',
              campus: userData.campus || 'Main Campus',
              role: 'admin',
              department: userData.department || 'Administration',
              isActive: userData.isActive ?? true
            });
          } else {
            router.push('/');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
      }
    };

    fetchAdminData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleToggleActiveStatus = async (checked: boolean) => {
    try {
      // Here you would typically make an API call to update the status
      setAdmin(prev => ({ ...prev, isActive: checked }));
      toast.success(`Admin status ${checked ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const generatePasskey = async (): Promise<string> => {
    try {
      // Generate a random 6-digit passkey
      const passkey = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the passkey in the database
      const response = await fetch('/api/settings/passkey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passkey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to store passkey');
      }

      if (!data.success) {
        throw new Error('Failed to store passkey in database');
      }

      return data.passkey;
    } catch (error) {
      console.error('Error generating passkey:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate passkey';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{admin.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{admin.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{admin.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Campus</p>
                    <p className="font-medium capitalize">{admin.campus}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium capitalize">{admin.department}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="active-status" className="text-sm text-gray-500">
                    Account Status
                  </Label>
                  <Switch
                    id="active-status"
                    checked={admin.isActive}
                    onCheckedChange={handleToggleActiveStatus}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  <Settings className="h-8 w-8" />
                  <span>Admin Dashboard</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => router.push('/tables')}
                >
                  <Building className="h-8 w-8" />
                  <span>Manage Tables</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => router.push('/overview')}
                >
                  <Shield className="h-8 w-8" />
                  <span>View Overview</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setIsPasskeyOverlayOpen(true)}
                >
                  <Key className="h-8 w-8" />
                  <span>Generate Passkey</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PasskeyOverlay
        isOpen={isPasskeyOverlayOpen}
        onClose={() => setIsPasskeyOverlayOpen(false)}
        onGenerate={generatePasskey}
      />
    </div>
  );
};

export default AdminProfile;