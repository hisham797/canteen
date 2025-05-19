import { ObjectId } from 'mongodb';

export interface Student {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  tableNumber: number;
  class: '8' | 'P1' | 'P2' | 'D1' | 'D2' | 'D3';
  createdAt: Date;
}

export const validateStudent = (student: Partial<Student>): string | null => {
  if (!student.firstName || typeof student.firstName !== 'string') {
    return 'First name is required';
  }
  
  if (!student.lastName || typeof student.lastName !== 'string') {
    return 'Last name is required';
  }
  
  if (!student.admissionNumber || typeof student.admissionNumber !== 'string') {
    return 'Admission number is required';
  }
  
  if (!student.tableNumber || typeof student.tableNumber !== 'number' || student.tableNumber < 1) {
    return 'Valid table number is required';
  }
  
  if (!student.class || !['8', 'P1', 'P2', 'D1', 'D2', 'D3'].includes(student.class)) {
    return 'Valid class is required';
  }
  
  return null;
}; 