'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, Edit, Trash, Plus, FileDown, FileText } from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/utils/export';

interface User {
  _id: string;
  fullName: string;
  admissionNumber: string;
  email: string;
  role: string;
  class: '8' | '9' | 'P1' | 'P2' | 'D1' | 'D2' | 'D3' | 'PG 1';
  campus: 'Main' | 'PG' | 'Dental';
  attendance: {
    coffee: boolean;
    breakfast: boolean;
    lunch: boolean;
    tea: boolean;
    dinner: boolean;
  };
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [newUser, setNewUser] = useState({
    fullName: '',
    admissionNumber: '',
    role: 'student',
    class: '8' as User['class'],
    campus: 'Main' as User['campus'],
  });

  const AVAILABLE_CLASSES = ['8','9', 'P1', 'P2', 'D1', 'D2', 'D3','PG 1'];
  const AVAILABLE_CAMPUSES = ['Main', 'PG', 'Dental'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query, selected class, and selected campus
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || user.class === selectedClass;
    const matchesCampus = selectedCampus === 'all' || user.campus === selectedCampus;
    
    return matchesSearch && matchesClass && matchesCampus;
  });

  const handleEditClick = (user: User) => {
    setSelectedUser({...user});
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: selectedUser.fullName,
          admissionNumber: selectedUser.admissionNumber,
          email: selectedUser.email,
          role: selectedUser.role,
          class: selectedUser.class,
          campus: selectedUser.campus
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      await fetchUsers();
      setIsDialogOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(message);
      console.error('Error updating user:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.admissionNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const userData = {
        ...newUser,
        password: '123456',
        email: `${newUser.admissionNumber.toLowerCase()}@school.com`
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      await fetchUsers();
      setIsAddDialogOpen(false);
      setNewUser({
        fullName: '',
        admissionNumber: '',
        role: 'student',
        class: '8' as User['class'],
        campus: 'Main' as User['campus'],
      });
      toast.success('User added successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(message);
      console.error('Error creating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      await fetchUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(message);
      console.error('Error deleting user:', error);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredUsers.map(user => ({
      'First Name': user.fullName.split(' ')[0],
      'Last Name': user.fullName.split(' ')[1],
      'Email': user.email,
      'Admission Number': user.admissionNumber,
      'Role': user.role,
      'Class': user.class,
      'Campus': user.campus
    }));
    
    exportToCSV(exportData, 'users.csv');
    toast.success('Users data exported to CSV');
  };

  const handleExportPDF = () => {
    const exportData = filteredUsers.map(user => ({
      'First Name': user.fullName.split(' ')[0],
      'Last Name': user.fullName.split(' ')[1],
      'Email': user.email,
      'Admission Number': user.admissionNumber,
      'Role': user.role,
      'Class': user.class,
      'Campus': user.campus
    }));
    
    exportToPDF(exportData, 'users.pdf', 'Users Report');
    toast.success('Users data exported to PDF');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="flex gap-2 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">All Classes</option>
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
              >
                <option value="all">All Campuses</option>
                {AVAILABLE_CAMPUSES.map((campus) => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NO</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Admission Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.admissionNumber}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.class}</TableCell>
                      <TableCell>{user.campus}</TableCell>
                      <TableCell>
                        <span className={
                          user.role === 'admin' 
                            ? 'text-purple-600 font-medium' 
                            : user.role === 'teacher' 
                              ? 'text-blue-600 font-medium'
                              : 'text-green-600 font-medium'
                        }>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditClick(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive" 
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user.role === 'admin'}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={selectedUser.fullName}
                  onChange={(e) => setSelectedUser({...selectedUser, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  value={selectedUser.admissionNumber}
                  onChange={(e) => setSelectedUser({...selectedUser, admissionNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <select
                  id="class"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedUser.class}
                  onChange={(e) => setSelectedUser({...selectedUser, class: e.target.value as User['class']})}
                >
                  {AVAILABLE_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="campus">Campus</Label>
                <select
                  id="campus"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedUser.campus}
                  onChange={(e) => setSelectedUser({...selectedUser, campus: e.target.value as User['campus']})}
                >
                  {AVAILABLE_CAMPUSES.map((campus) => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                  disabled={selectedUser.role === 'admin'}
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newFullName">Full Name</Label>
              <Input
                id="newFullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newAdmissionNumber">Admission Number</Label>
              <Input
                id="newAdmissionNumber"
                value={newUser.admissionNumber}
                onChange={(e) => setNewUser({...newUser, admissionNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRole">Role</Label>
              <select
                id="newRole"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCampus">Campus</Label>
              <select
                id="newCampus"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUser.campus}
                onChange={(e) => setNewUser({...newUser, campus: e.target.value as User['campus']})}
              >
                {AVAILABLE_CAMPUSES.map((campus) => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newClass">Class</Label>
              <select
                id="newClass"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUser.class}
                onChange={(e) => setNewUser({...newUser, class: e.target.value as User['class']})}
              >
                {AVAILABLE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
