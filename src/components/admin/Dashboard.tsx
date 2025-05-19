import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  UserPlus,
  ArrowRight,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  PlusCircle,
  GraduationCap,
  TableProperties,
  MessageSquare,
  Loader2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from 'sonner';

interface FetchedStats {
  totalStudents: number;
  totalUsers: number;
  totalTables: number;
  totalMessages: number;
}

const AdminDashboard = () => {
  const [fetchedStats, setFetchedStats] = useState<FetchedStats>({
    totalStudents: 0,
    totalUsers: 0,
    totalTables: 0,
    totalMessages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration of UI structure - replace with actual fetched data if needed
  const recentActivity = [
    { id: 1, student: "Mark Johnson", action: "Marked as absent", time: "2 minutes ago", status: "absent" },
    { id: 2, student: "Emily Taylor", action: "Added to Table 4", time: "10 minutes ago", status: "new" },
    { id: 3, student: "James Wilson", action: "Marked as present", time: "15 minutes ago", status: "present" },
    { id: 4, student: "Sophia Brown", action: "Changed from Table 2 to Table 5", time: "30 minutes ago", status: "update" }
  ];

  // Data for the weekly attendance chart (using mock data for structure)
  const weeklyAttendanceData = [
    { name: "Mon", students: 71, fill: "#9b87f5" },
    { name: "Tue", students: 89, fill: "#9b87f5" },
    { name: "Wed", students: 78, fill: "#9b87f5" },
    { name: "Thu", students: 96, fill: "#9b87f5" },
    { name: "Fri", students: 84, fill: "#9b87f5" },
    { name: "Sat", students: 60, fill: "#9b87f5" },
    { name: "Sun", students: 98, fill: "#7E69AB" } // Current day highlighted
  ];

  // Helper function for status badges (using mock data statuses)
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "present":
        return <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-500 hover:bg-red-600">Absent</Badge>;
      case "new":
        return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case "update":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Update</Badge>;
      case "excellent":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Excellent</Badge>;
      case "good":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Good</Badge>;
      case "average":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Average</Badge>;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data: FetchedStats = await response.json();
        setFetchedStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-canteen-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor canteen attendance.</p>
        </div>
        {/* Optional: Add buttons here */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Students</p>
                <h3 className="text-3xl font-bold mt-2 text-blue-600">{fetchedStats.totalStudents}</h3>
                <p className="text-xs text-muted-foreground mt-1">Total registered</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <GraduationCap size={20} className="text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Users</p>
                <h3 className="text-3xl font-bold mt-2 text-purple-600">{fetchedStats.totalUsers}</h3>
                <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users size={20} className="text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tables</p>
                <h3 className="text-3xl font-bold mt-2 text-amber-600">{fetchedStats.totalTables}</h3>
                <p className="text-xs text-muted-foreground mt-1">In canteen</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <TableProperties size={20} className="text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                <h3 className="text-3xl font-bold mt-2 text-green-600">{fetchedStats.totalMessages}</h3>
                <p className="text-xs text-muted-foreground mt-1">New notifications</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageSquare size={20} className="text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Attendance Chart Card - Spans 4 columns */}
       <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Attendance</CardTitle>
                <CardDescription>Attendance trends over the past 7 days</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                View All <ArrowRight size={14} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-auto">
              <ChartContainer
                config={{
                  students: {
                    label: "Students",
                    theme: {
                      light: "#9b87f5", 
                      dark: "#7E69AB",
                    },
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAttendanceData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#888888', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#888888', fontSize: 12 }}
                      domain={[0, 'dataMax + 10']}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent 
                          labelFormatter={(value) => `${value}'s Attendance`}
                        />
                      }
                    />
                    <Bar 
                      dataKey="students" 
                      radius={[4, 4, 4, 4]} 
                      barSize={40}
                      fill="var(--color-students)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card - Spans 3 columns */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions in the system</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight size={14} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users size={20} className="text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{activity.student}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* You can add more sections here, e.g., for upcoming events */}
    </div>
  );
};

export default AdminDashboard;
