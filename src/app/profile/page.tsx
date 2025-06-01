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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';

interface AdminUser {
  fullName: string;
  email: string;
  phone: string;
  campus: string;
  role: 'admin';
  isActive: boolean;
  permissions: string[];
}

interface PasskeyInfo {
  passkey: string;
  expiresAt: string;
  isActive: boolean;
}

const AdminProfile = () => {
  const [user, setUser] = useState<AdminUser>({
    fullName: 'Admin User',
    email: 'admin@example.com',
    phone: '+1234567890',
    campus: 'Main Campus',
    role: 'admin',
    isActive: true,
    permissions: ['manage_users', 'manage_attendance', 'view_reports']
  });
  const [isPasskeyDialogOpen, setIsPasskeyDialogOpen] = useState(false);
  const [passkeyInfo, setPasskeyInfo] = useState<PasskeyInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleToggleActive = (checked: boolean) => {
    setUser(prev => ({ ...prev, isActive: checked }));
    toast.success(`Account ${checked ? 'activated' : 'deactivated'}`);
  };

  const generatePasskey = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/settings/passkey', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPasskeyInfo({
          passkey: data.passkey,
          expiresAt: data.expiresAt,
          isActive: true
        });
        toast.success('Passkey generated successfully');
      } else {
        toast.error(data.error || 'Failed to generate passkey');
      }
    } catch (error) {
      console.error('Error generating passkey:', error);
      toast.error('Failed to generate passkey');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchCurrentPasskey = async () => {
    try {
      const response = await fetch('/api/settings/passkey');
      const data = await response.json();
      
      if (data.success) {
        setPasskeyInfo({
          passkey: data.passkey,
          expiresAt: data.expiresAt,
          isActive: data.isActive
        });
      }
    } catch (error) {
      console.error('Error fetching passkey:', error);
    }
  };

  useEffect(() => {
    if (isPasskeyDialogOpen) {
      fetchCurrentPasskey();
    }
  }, [isPasskeyDialogOpen]);

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
                    <p className="font-medium">{user.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Campus</p>
                    <p className="font-medium capitalize">{user.campus}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="active-status" className="text-sm text-gray-500">
                    Account Status
                  </Label>
                  <Switch
                    id="active-status"
                    checked={user.isActive}
                    onCheckedChange={handleToggleActive}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Admin Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Settings className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium capitalize">
                          {permission.split('_').join(' ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {permission === 'manage_users' && 'Manage user accounts and permissions'}
                          {permission === 'manage_attendance' && 'Manage attendance records and reports'}
                          {permission === 'view_reports' && 'Access and generate system reports'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4" onClick={() => router.push('/admin/dashboard')}>
                  <div className="flex flex-col items-center space-y-2">
                    <Settings className="h-6 w-6" />
                    <span>Admin Dashboard</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4" onClick={() => router.push('/tables')}>
                  <div className="flex flex-col items-center space-y-2">
                    <Building className="h-6 w-6" />
                    <span>Manage Tables</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4" onClick={() => router.push('/overview')}>
                  <div className="flex flex-col items-center space-y-2">
                    <Shield className="h-6 w-6" />
                    <span>View Overview</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4" 
                  onClick={() => setIsPasskeyDialogOpen(true)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Key className="h-6 w-6" />
                    <span>Generate Passkey</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Passkey Dialog */}
        <Dialog open={isPasskeyDialogOpen} onOpenChange={setIsPasskeyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Passkey Management</DialogTitle>
              <DialogDescription>
                Generate a new passkey for secure access. The passkey will expire in 24 hours.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {passkeyInfo ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Passkey</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={passkeyInfo.passkey} 
                        readOnly 
                        className="font-mono text-lg tracking-wider"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(passkeyInfo.passkey);
                          toast.success('Passkey copied to clipboard');
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Expires: {format(new Date(passkeyInfo.expiresAt), 'PPp')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No active passkey found
                </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={generatePasskey}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate New Passkey'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminProfile; 