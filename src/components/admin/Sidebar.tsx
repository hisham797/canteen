'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, Home } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
    },
    {
      title: 'Students',
      path: '/admin/students',
      icon: <Users className="h-5 w-5 mr-2" />,
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5 mr-2" />,
    },
    {
      title: 'Messages',
      path: '/admin/messages',
      icon: <MessageSquare className="h-5 w-5 mr-2" />,
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 h-screen w-64 fixed left-0 top-0 z-20 flex flex-col">
      <div className="p-4 border-b">
        <Link href="/admin/dashboard" className="text-xl font-bold text-canteen-blue flex items-center">
          CanteenTracker
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                  isActive(item.path) 
                    ? 'bg-canteen-blue text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t border-gray-200 p-4 space-y-2">
        <Link
          href="/"
          className="flex items-center px-4 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          <span>Return to Site</span>
        </Link>
        <Button 
          onClick={handleLogout} 
          variant="destructive" 
          className="w-full flex items-center justify-center"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
