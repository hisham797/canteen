'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, UserRound, LogOut, Settings, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ 
    name?: string;
    admissionNumber?: string;
    fullName?: string;
    role?: 'admin' | 'student';
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    setUser(null);
    router.push('/');
  };

  // Get the first letter of the name or admission number for the avatar
  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.admissionNumber) {
      return user.admissionNumber.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-canteen-blue">CanteenTracker</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-canteen-blue px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/overview" className="text-gray-700 hover:text-canteen-blue px-3 py-2 rounded-md text-sm font-medium">
              Overview
            </Link>
            <Link href="/tables" className="text-gray-700 hover:text-canteen-blue px-3 py-2 rounded-md text-sm font-medium">
              Tables
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-canteen-blue px-3 py-2 rounded-md text-sm font-medium">
              Messages
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 bg-canteen-blue text-white cursor-pointer">
                    <AvatarFallback>{getInitial()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled className="font-medium">
                    {user.fullName || user.admissionNumber || 'Admin'}
                  </DropdownMenuItem>
                  {user.role === 'admin' ? (
                    <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => router.push('/userprofile')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-canteen-blue px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/signup">
                  <Button className="ml-4">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex md:hidden items-center">
            <button
              type="button"
              className="text-gray-700 hover:text-canteen-blue"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <Link href="/" className="text-gray-700 hover:text-canteen-blue block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link href="/tables" className="text-gray-700 hover:text-canteen-blue block px-3 py-2 rounded-md text-base font-medium">
              Tables
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-canteen-blue block px-3 py-2 rounded-md text-base font-medium">
              <MessageSquare className="inline-block mr-1 w-4 h-4" />
              Messages
            </Link>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link href="/admin" className="text-gray-700 hover:text-canteen-blue block px-3 py-2 rounded-md text-base font-medium">
                    Admin Panel
                  </Link>
                ) : (
                  <Link href="/userprofile" className="text-gray-700 hover:text-canteen-blue block px-3 py-2 rounded-md text-base font-medium">
                    Profile
                  </Link>
                )}
                <a 
                  onClick={handleLogout} 
                  className="text-red-600 hover:text-red-800 block px-3 py-2 rounded-md text-base font-medium cursor-pointer"
                >
                  Logout
                </a>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-canteen-blue block px-3 py-2 rounded-md text-base font-medium">
                  Login
                </Link>
                <Link href="/signup" className="text-gray-700 hover:text-canteen-blue block px-3 py-2 rounded-md text-base font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
