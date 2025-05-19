'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import StudentsPage from '@/components/admin/StudentsPage';

const AdminStudents = () => {
  const router = useRouter();
  
  // Check if the user is logged in and is an admin
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <StudentsPage />
      </div>
    </div>
  );
};

export default AdminStudents;
