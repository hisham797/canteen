'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Coffee, Egg, Sandwich, CupSoda, Utensils, Check, X, Moon, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface User {
  admissionNumber: string;
  fullName: string;
  role: string;
  email: string;
  class: string;
  attendance: {
    coffee: { present: boolean; sick?: boolean; sickReason?: string };
    breakfast: { present: boolean; sick?: boolean; sickReason?: string };
    lunch: { present: boolean; sick?: boolean; sickReason?: string };
    tea: { present: boolean; sick?: boolean; sickReason?: string };
    dinner: { present: boolean; sick?: boolean; sickReason?: string };
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
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<'present' | 'absent' | 'sick'>('present');
  const [sickReason, setSickReason] = useState('');

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

  const handleAttendanceClick = (mealId: string) => {
    setSelectedMeal(mealId);
    setAttendanceType('present');
    setSickReason('');
    setIsAttendanceDialogOpen(true);
  };

  const handleAttendanceChange = async () => {
    if (!user || !selectedMeal) return;

    try {
      const updatedAttendance = {
        ...user.attendance,
        [selectedMeal]: {
          present: attendanceType === 'present',
          sick: attendanceType === 'sick',
          sickReason: attendanceType === 'sick' ? sickReason : undefined
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

      if (!response.ok) throw new Error('Failed to update attendance');

      setUser({
        ...user,
        attendance: updatedAttendance
      });

      setIsAttendanceDialogOpen(false);
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

  const getAttendanceStatus = (meal: string) => {
    if (!user) return { present: false, sick: false };
    const mealAttendance = user.attendance[meal as keyof typeof user.attendance];
    return {
      present: mealAttendance.present,
      sick: mealAttendance.sick || false,
      sickReason: mealAttendance.sickReason
    };
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
              <CardDescription>Click on a meal to update your attendance status</CardDescription>
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
                          : status.sick
                          ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
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
                          ) : status.sick ? (
                            <div className="flex items-center text-yellow-600">
                              <AlertTriangle className="h-5 w-5 mr-1" />
                              <span className="font-medium">Sick</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <X className="h-5 w-5 mr-1" />
                              <span className="font-medium">Absent</span>
                            </div>
                          )}
                          <div 
                            className={`ml-3 w-3 h-3 rounded-full ${
                              status.present ? 'bg-green-500' : status.sick ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          ></div>
                        </div>
                      </div>
                      {status.sick && status.sickReason && (
                        <div className="mt-2 text-sm text-yellow-700">
                          Reason: {status.sickReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Dialog */}
        <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Attendance Status</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {/* Present Toggle */}
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <Label htmlFor="present" className="text-base">Present</Label>
                </div>
                <Switch
                  id="present"
                  checked={attendanceType === 'present'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAttendanceType('present');
                      setSickReason('');
                    }
                  }}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Sick Toggle */}
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <Label htmlFor="sick" className="text-base">Sick</Label>
                </div>
                <Switch
                  id="sick"
                  checked={attendanceType === 'sick'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAttendanceType('sick');
                    }
                  }}
                  className="data-[state=checked]:bg-yellow-600"
                />
              </div>

              {/* Absent Toggle */}
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-red-600" />
                  <Label htmlFor="absent" className="text-base">Absent</Label>
                </div>
                <Switch
                  id="absent"
                  checked={attendanceType === 'absent'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAttendanceType('absent');
                      setSickReason('');
                    }
                  }}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>

              {attendanceType === 'sick' && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="sickReason" className="text-base">Reason for being sick:</Label>
                  <Textarea
                    id="sickReason"
                    value={sickReason}
                    onChange={(e) => setSickReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAttendanceChange}
                disabled={attendanceType === 'sick' && !sickReason.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
