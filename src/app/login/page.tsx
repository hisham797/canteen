'use client';
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoginForm from '@/components/authentication/LoginForm';

const Login = () => {
  return (
    <div className=" flex flex-col">
      
      <main className="flex-grow container mx-auto px-4 py-[10rem] ">
        <div className="max-w-md mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Login to Your Account</h1>
          <p className="text-gray-600">
            Access your canteen tracker account
          </p>
        </div>
        <LoginForm />
      </main>
      
    </div>
  );
};

export default Login;
