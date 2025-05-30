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
  class: '8' | '9' | 'P1' | 'P2' | 'D1' | 'D2' | 'D3' | 'PG 1';
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
  const [newStudent, setNewStudent] = useState<Omit<Student, '_id'>>({
    firstName: '',
    lastName: '',
    admissionNumber: '',
    class: '8',
    tableNumber: 1,
    isPresent: false
  });

  const AVAILABLE_CLASSES = ['8','9', 'P1', 'P2', 'D1', 'D2', 'D3','PG 1'];

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

  // Filter students based on search query and selected class
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.tableNumber.toString().includes(searchQuery);
    
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    
    return matchesSearch && matchesClass;
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
            class: selectedStudent.class,
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
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.admissionNumber || !newStudent.class) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
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
        class: '8', 
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

  const handleDeleteStudent = async (id: string) => {
    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete student');
      }

      await fetchStudents();
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
                            onClick={() => student._id && handleDeleteStudent(student._id)}
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
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  value={selectedStudent.admissionNumber}
                  onChange={(e) => setSelectedStudent({...selectedStudent, admissionNumber: e.target.value})}
                />
              </div>
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
              <Label htmlFor="newAdmissionNumber">Admission Number</Label>
              <Input
                id="newAdmissionNumber"
                value={newStudent.admissionNumber}
                onChange={(e) => setNewStudent({...newStudent, admissionNumber: e.target.value})}
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="newTableNumber">Table Number</Label>
              <Input
                id="newTableNumber"
                type="number"       
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
    </div>
  );
};

export default StudentsPage;
