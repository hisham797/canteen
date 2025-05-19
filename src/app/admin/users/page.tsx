'use client';
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import UsersPage from '@/components/admin/UsersPage';

const AdminUsers = () => {
  return (
    <AdminLayout>
      <UsersPage />
    </AdminLayout>
  );
};

export default AdminUsers;
