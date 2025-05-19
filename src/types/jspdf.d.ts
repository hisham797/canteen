import 'jspdf';

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    head: string[][];
    body: string[][];
    startY?: number;
    margin?: { top?: number };
    styles?: { fontSize?: number };
    headStyles?: { fillColor?: number[] };
  }

  interface jsPDF {
    autoTable: (options: AutoTableOptions) => void;
  }
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head: string[][];
      body: string[][];
      startY?: number;
      margin?: { top?: number };
      styles?: { fontSize?: number };
      headStyles?: { fillColor?: number[] };
    }) => void;
  }
} 