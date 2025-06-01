import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Egg, Sandwich, CupSoda, Utensils } from 'lucide-react';

// Define meal times and their corresponding icons
const mealTimes = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'breakfast', label: 'Breakfast', icon: Egg },
  { id: 'lunch', label: 'Lunch', icon: Sandwich },
  { id: 'tea', label: 'Tea', icon: CupSoda },
  { id: 'dinner', label: 'Dinner', icon: Utensils },
];

type Campus = 'dawa academy' | 'hifz' | 'daiya stafs' | 'ayadi' | 'office stafs';

interface MealAttendance {
  present: number;
  absent: number;
  sick: number;
  presentStudents: any[];
  absentStudents: any[];
  sickStudents: any[];
  campusTotals: Record<Campus, number>;
}

interface AttendanceSummary {
  coffee: MealAttendance;
  breakfast: MealAttendance;
  lunch: MealAttendance;
  tea: MealAttendance;
  dinner: MealAttendance;
  totalSick: number;
  sickStudents: any[];
}

interface MealAttendanceTableProps {
  attendanceSummary: AttendanceSummary | null;
  availableCampuses: Campus[];
}

const MealAttendanceTable: React.FC<MealAttendanceTableProps> = ({
  attendanceSummary,
  availableCampuses,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="font-medium text-lg mb-4">Meal Attendance by Campus</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Campus</th>
                {mealTimes.map(meal => (
                  <th key={meal.id} className="text-center py-3 px-4 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <meal.icon className="h-4 w-4" />
                      <span>{meal.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availableCampuses.map(campus => {
                const campusTotals = {
                  coffee: attendanceSummary?.coffee?.campusTotals[campus] || 0,
                  breakfast: attendanceSummary?.breakfast?.campusTotals[campus] || 0,
                  lunch: attendanceSummary?.lunch?.campusTotals[campus] || 0,
                  tea: attendanceSummary?.tea?.campusTotals[campus] || 0,
                  dinner: attendanceSummary?.dinner?.campusTotals[campus] || 0
                };

                return (
                  <tr key={campus} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium capitalize">{campus}</td>
                    {mealTimes.map(meal => (
                      <td key={`${campus}-${meal.id}`} className="text-center py-3 px-4">
                        <Badge variant="secondary" className={`${
                          meal.id === 'coffee' ? 'bg-blue-50 text-blue-700' :
                          meal.id === 'breakfast' ? 'bg-green-50 text-green-700' :
                          meal.id === 'lunch' ? 'bg-yellow-50 text-yellow-700' :
                          meal.id === 'tea' ? 'bg-purple-50 text-purple-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {campusTotals[meal.id as keyof typeof campusTotals]}
                        </Badge>
                      </td> 
                    ))}
                  </tr>
                );
              })}
              {/* Grand Totals Row */}
              <tr className="bg-gray-50 font-bold">
                <td className="py-3 px-4">Total</td>
                {mealTimes.map(meal => {
                  const mealTotal = Object.values(attendanceSummary?.[meal.id as keyof Omit<AttendanceSummary, 'totalSick' | 'sickStudents'>]?.campusTotals || {}).reduce((sum, count) => sum + count, 0);
                  return (
                    <td key={`total-${meal.id}`} className="text-center py-3 px-4">
                      <Badge variant="secondary" className={`${
                        meal.id === 'coffee' ? 'bg-blue-100 text-blue-800' :
                        meal.id === 'breakfast' ? 'bg-green-100 text-green-800' :
                        meal.id === 'lunch' ? 'bg-yellow-100 text-yellow-800' :
                        meal.id === 'tea' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {mealTotal}
                      </Badge>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealAttendanceTable; 