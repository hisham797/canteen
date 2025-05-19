
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SignupForm from '@/components/authentication/SignupForm';

const Signup = () => {
  return (
    <div className=" flex flex-col">
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-gray-600">
            Join the canteen tracker platform
          </p>
        </div>
        <SignupForm />
      </main>
      
    </div>
  );
};

export default Signup;
