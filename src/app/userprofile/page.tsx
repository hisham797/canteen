'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Coffee, Egg, Sandwich, CupSoda, Utensils, Check, X } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface User {
  admissionNumber: string;
  fullName: string;
  role: string;
  email: string;
  class: string;
  campus: string;
  attendance: {
    coffee: { present: boolean };
    breakfast: { present: boolean };
    lunch: { present: boolean };
    tea: { present: boolean };
    dinner: { present: boolean };
  };
  isSick?: boolean;
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
      
      // Initialize attendance if it doesn't exist, setting all to present by default
      if (!userData.attendance) {
        userData.attendance = {
          coffee: { present: true },
          breakfast: { present: true },
          lunch: { present: true },
          tea: { present: true },
          dinner: { present: true }
        };
      }
      
      setUser(userData);
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceClick = async (mealId: string) => {
    if (!user || user.isSick) {
      if (user?.isSick) {
        toast.error('Cannot update attendance while marked as sick');
      }
      return;
    }

    try {
      const currentStatus = getAttendanceStatus(mealId);
      const updatedAttendance = {
        ...user.attendance,
        [mealId]: {
          present: !currentStatus.present
        }
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update attendance');
      }

      setUser({
        ...user,
        attendance: updatedAttendance
      });

      toast.success(`Marked as ${!currentStatus.present ? 'present' : 'absent'} for ${mealTimes.find(m => m.id === mealId)?.label}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update attendance');
    }
  };

  const handleToggleSickStatus = async () => {
    if (!user) return;

    try {
      // First update the sick status in the users collection
      const userResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admissionNumber: user.admissionNumber,
          isSick: !user.isSick
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || 'Failed to update sick status');
      }

      // If marking as sick, update all attendance to present
      if (!user.isSick) {
        const updatedAttendance = {
          coffee: { present: true },
          breakfast: { present: true },
          lunch: { present: true },
          tea: { present: true },
          dinner: { present: true }
        };

        const attendanceResponse = await fetch('/api/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admissionNumber: user.admissionNumber,
            attendance: updatedAttendance
          }),
        });

        if (!attendanceResponse.ok) {
          const errorData = await attendanceResponse.json();
          throw new Error(errorData.error || 'Failed to update attendance');
        }

        setUser(prev => ({
          ...prev!,
          attendance: updatedAttendance,
          isSick: true
        }));
      } else {
        setUser(prev => ({
          ...prev!,
          isSick: false
        }));
      }

      toast.success(`You are now marked as ${user.isSick ? 'not sick' : 'sick'}`);
    } catch (error) {
      console.error('Error updating sick status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update sick status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getAttendanceStatus = (meal: string) => {
    if (!user || !user.attendance) return { present: false };
    
    const mealAttendance = user.attendance[meal as keyof typeof user.attendance];
    if (!mealAttendance) return { present: false };
    
    return {
      present: mealAttendance.present
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-blue-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">Loading Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col">
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
                <div>
                  <p className="text-sm text-gray-500">Campus</p>
                  <p className="font-medium capitalize">{user.campus}</p>
                </div>
                {user.campus === 'dawa academy' && (
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="sick-status" className="text-sm text-gray-500">
                      Mark as Sick
                    </Label>
                    <Switch
                      id="sick-status"
                      checked={user.isSick}
                      onCheckedChange={handleToggleSickStatus}
                      className="data-[state=checked]:bg-yellow-600"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Settings Card */}
          {!user.isSick && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Attendance Status</CardTitle>
                <CardDescription>Click on a meal to toggle your attendance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mealTimes.map((meal) => {
                    const status = getAttendanceStatus(meal.id);
                    return (
                      <div 
                        key={meal.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          status.present
                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                            : 'bg-red-50 border-red-200 hover:bg-red-100'
                        }`}
                        onClick={() => handleAttendanceClick(meal.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <meal.icon className="h-5 w-5 mr-3" />
                            <h3 className="font-medium">{meal.label}</h3>
                          </div>
                          <div className="flex items-center">
                            {status.present ? (
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
                                status.present ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
