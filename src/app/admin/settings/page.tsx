'use client';
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SettingsPage from '@/components/admin/SettingsPage';

const AdminSettings = () => {
  return (
    <AdminLayout>
      <SettingsPage />
    </AdminLayout>
  );
};

export default AdminSettings;
