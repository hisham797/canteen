'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Coffee, Egg, Sandwich, CupSoda, Utensils, Check, X, Moon } from 'lucide-react';

interface User {
  admissionNumber: string;
  fullName: string;
  role: string;
  email: string;
  class: string;
  attendance: {
    coffee: boolean;
    breakfast: boolean;
    lunch: boolean;
    tea: boolean;
    dinner: boolean;
  };
}

// Define meal times and their corresponding icons
const mealTimes = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'breakfast', label: 'Breakfast', icon: Egg },
  { id: 'lunch', label: 'Lunch', icon: Sandwich },
  { id: 'tea', label: 'Tea', icon: CupSoda },
  { id: 'dinner', label: 'Dinner', icon: Utensils },
];

const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    fetchUserData(userData.admissionNumber);
  }, [router]);

  const fetchUserData = async (admissionNumber: string) => {
    try {
      const response = await fetch(`/api/users?admissionNumber=${admissionNumber}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = async (mealId: string) => {
    if (!user) return;

    try {
      const updatedAttendance = {
        ...user.attendance,
        [mealId]: !user.attendance[mealId as keyof typeof user.attendance]
      };

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admissionNumber: user.admissionNumber,
          attendance: updatedAttendance
        }),
      });

      if (!response.ok) throw new Error('Failed to update attendance');

      setUser({
        ...user,
        attendance: updatedAttendance
      });

      toast.success('Attendance updated successfully');
    } catch (error) {
      toast.error('Failed to update attendance');
      console.error('Error updating attendance:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className=" flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admission Number</p>
                  <p className="font-medium">{user.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium capitalize">{user.class}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Settings Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Attendance Settings</CardTitle>
              <CardDescription>Click on a meal to toggle your attendance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mealTimes.map((meal) => (
                  <div 
                    key={meal.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      user.attendance[meal.id as keyof typeof user.attendance]
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : 'bg-red-50 border-red-200 hover:bg-red-100'
                    }`}
                    onClick={() => handleAttendanceChange(meal.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <meal.icon className="h-5 w-5 mr-3" />
                        <h3 className="font-medium">{meal.label}</h3>
                      </div>
                      <div className="flex items-center">
                        {user.attendance[meal.id as keyof typeof user.attendance] ? (
                          <div className="flex items-center text-green-600">
                            <Check className="h-5 w-5 mr-1" />
                            <span className="font-medium">Present</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <X className="h-5 w-5 mr-1" />
                            <span className="font-medium">Absent</span>
                          </div>
                        )}
                        <div 
                          className={`ml-3 w-3 h-3 rounded-full ${
                            user.attendance[meal.id as keyof typeof user.attendance] ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
