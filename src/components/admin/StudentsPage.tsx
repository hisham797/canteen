'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, Edit, Trash, Plus, FileDown, FileText } from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/utils/export';

interface Student {
  _id?: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  phoneNumber?: string;
  class: '8' | '9' | 'P1' | 'P2' | 'D1' | 'D2' | 'D3' | 'PG 1' | '';
  campus: 'dawa academy' | 'hifz' | 'daiya stafs' | 'ayadi' | 'office stafs';
  tableNumber: number;
  isPresent: boolean;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [newStudent, setNewStudent] = useState<Omit<Student, '_id'>>({
    firstName: '',
    lastName: '',
    admissionNumber: '',
    phoneNumber: '',
    class: '8',
    campus: 'dawa academy',
    tableNumber: 1,
    isPresent: false
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const AVAILABLE_CLASSES = ['8','9', 'P1', 'P2', 'D1', 'D2', 'D3','PG 1'];
  const AVAILABLE_CAMPUSES = ['dawa academy', 'hifz', 'daiya stafs','ayadi','office stafs'];

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Error fetching students:', error);
    }
  };

  // Filter students based on search query, selected class, and selected campus
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.tableNumber.toString().includes(searchQuery);
    
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    const matchesCampus = selectedCampus === 'all' || student.campus === selectedCampus;
    
    return matchesSearch && matchesClass && matchesCampus;
  });

  const handleEditClick = (student: Student) => {
    setSelectedStudent({...student});
    setIsDialogOpen(true);
  };

  const handleAddStudent = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveStudent = async () => {
    if (selectedStudent) {
      try {
        const response = await fetch('/api/students', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: selectedStudent._id,
            firstName: selectedStudent.firstName,
            lastName: selectedStudent.lastName,
            admissionNumber: selectedStudent.admissionNumber,
            class: selectedStudent.campus === 'dawa academy' ? selectedStudent.class : '',
            campus: selectedStudent.campus,
            tableNumber: selectedStudent.tableNumber,
            oldAdmissionNumber: selectedStudent.admissionNumber
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update student');
        }

        await fetchStudents();
        setIsDialogOpen(false);
        toast.success('Student updated successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update student';
        toast.error(message);
        console.error('Error updating student:', error);
      }
    }
  };

  const handleCreateStudent = async () => {
    const isStaffCampus = ['office stafs', 'ayadi', 'daiya stafs'].includes(newStudent.campus);
    
    if (!newStudent.firstName || !newStudent.lastName || 
        (isStaffCampus && !newStudent.phoneNumber) ||
        (!isStaffCampus && !newStudent.admissionNumber) ||
        (newStudent.campus === 'dawa academy' && !newStudent.class)) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newStudent,
          admissionNumber: isStaffCampus ? newStudent.phoneNumber : newStudent.admissionNumber,
          class: newStudent.campus === 'dawa academy' ? newStudent.class : ''
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student');
      }

      await fetchStudents();
      setIsAddDialogOpen(false);
      setNewStudent({ 
        firstName: '', 
        lastName: '', 
        admissionNumber: '', 
        phoneNumber: '',
        class: '8', 
        campus: 'dawa academy', 
        tableNumber: 1, 
        isPresent: false 
      });
      toast.success('Student added successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create student';
      toast.error(message);
      console.error('Error creating student:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const response = await fetch(`/api/students?id=${studentToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete student');
      }

      await fetchStudents();
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
      toast.success('Student deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete student';
      toast.error(message);
      console.error('Error deleting student:', error);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredStudents.map(({ _id, ...student }) => ({
      'First Name': student.firstName,
      'Last Name': student.lastName,
      'Admission Number': student.admissionNumber,
      'Class': student.class,
      'Campus': student.campus,
      'Table Number': student.tableNumber,
    }));
    
    exportToCSV(exportData, 'students.csv');
    toast.success('Students data exported to CSV');
  };

  const handleExportPDF = () => {
    const exportData = filteredStudents.map(({ _id, ...student }) => ({
      'First Name': student.firstName,
      'Last Name': student.lastName,
      'Admission Number': student.admissionNumber,
      'Class': student.class,
      'Campus': student.campus,
      'Table Number': student.tableNumber, 
    }));
    
    exportToPDF(exportData, 'students.pdf', 'Students Report');
    toast.success('Students data exported to PDF');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Students</CardTitle>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
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
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Admission Number</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <TableRow key={student._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.firstName}</TableCell>
                      <TableCell>{student.lastName}</TableCell>
                      <TableCell>{student.admissionNumber}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.campus}</TableCell>
                      <TableCell>Table {student.tableNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditClick(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive" 
                            onClick={() => student._id && handleDeleteClick(student._id)}
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
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Student Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={selectedStudent.firstName}
                  onChange={(e) => setSelectedStudent({...selectedStudent, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={selectedStudent.lastName}
                  onChange={(e) => setSelectedStudent({...selectedStudent, lastName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campus">Campus</Label>
                <select
                  id="campus"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedStudent.campus}
                  onChange={(e) => {
                    const newCampus = e.target.value as Student['campus'];
                    setSelectedStudent({
                      ...selectedStudent, 
                      campus: newCampus,
                      class: newCampus === 'dawa academy' ? selectedStudent.class : '',
                      admissionNumber: '',
                      phoneNumber: ''
                    });
                  }}
                >
                  {AVAILABLE_CAMPUSES.map((campus) => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>
              </div>
              {['office stafs', 'ayadi', 'daiya stafs'].includes(selectedStudent.campus) ? (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={selectedStudent.phoneNumber || ''}
                    onChange={(e) => setSelectedStudent({...selectedStudent, phoneNumber: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="admissionNumber">Admission Number</Label>
                  <Input
                    id="admissionNumber"
                    value={selectedStudent.admissionNumber}
                    onChange={(e) => setSelectedStudent({...selectedStudent, admissionNumber: e.target.value})}
                  />
                </div>
              )}
              {selectedStudent.campus === 'dawa academy' && (
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <select
                    id="class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedStudent.class}
                    onChange={(e) => setSelectedStudent({...selectedStudent, class: e.target.value as Student['class']})}
                  >
                    {AVAILABLE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Table Number</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  min="1"
                  max="8"
                  value={selectedStudent.tableNumber}
                  onChange={(e) => setSelectedStudent({...selectedStudent, tableNumber: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newFirstName">First Name</Label>
              <Input
                id="newFirstName"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newLastName">Last Name</Label>
              <Input
                id="newLastName"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCampus">Campus</Label>
              <select
                id="newCampus"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newStudent.campus}
                onChange={(e) => {
                  const newCampus = e.target.value as Student['campus'];
                  setNewStudent({
                    ...newStudent, 
                    campus: newCampus,
                    class: newCampus === 'dawa academy' ? newStudent.class : '',
                    admissionNumber: '',
                    phoneNumber: ''
                  });
                }}
              >
                {AVAILABLE_CAMPUSES.map((campus) => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </select>
            </div>
            {['office stafs', 'ayadi', 'daiya stafs'].includes(newStudent.campus) ? (
              <div className="space-y-2">
                <Label htmlFor="newPhoneNumber">Phone Number</Label>
                <Input
                  id="newPhoneNumber"
                  value={newStudent.phoneNumber}
                  onChange={(e) => setNewStudent({...newStudent, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="newAdmissionNumber">Admission Number</Label>
                <Input
                  id="newAdmissionNumber"
                  value={newStudent.admissionNumber}
                  onChange={(e) => setNewStudent({...newStudent, admissionNumber: e.target.value})}
                />
              </div>
            )}
            {newStudent.campus === 'dawa academy' && (
              <div className="space-y-2">
                <Label htmlFor="newClass">Class</Label>
                <select
                  id="newClass"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newStudent.class}
                  onChange={(e) => setNewStudent({...newStudent, class: e.target.value as Student['class']})}
                >
                  {AVAILABLE_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newTableNumber">Table Number</Label>
              <Input
                id="newTableNumber"
                type="number"
                min="1"
                max="8"
                value={newStudent.tableNumber}
                onChange={(e) => setNewStudent({...newStudent, tableNumber: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateStudent}>Add Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteStudent}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsPage;
