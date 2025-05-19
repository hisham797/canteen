
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Real-time Attendance',
    description: 'Track attendance in real-time. Mark students as present or absent with a single click.',
    icon: '🕒'
  },
  {
    title: 'Table Overview',
    description: 'See a complete overview of all canteen tables and their occupants at a glance.',
    icon: '🍽️'
  },
  {
    title: 'Admin Dashboard',
    description: 'Powerful admin dashboard with detailed analytics and management tools.',
    icon: '📊'
  },
  {
    title: 'Secure Login',
    description: 'Secure authentication system for both students and administrators.',
    icon: '🔒'
  }
];

const FeaturesSection = () => {
  return (
    <section id="features-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform provides powerful tools to manage canteen attendance efficiently and effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover border border-gray-200">
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Table Visualization</h3>
            <p className="text-gray-600">See how the tables are organized and track attendance status.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((tableNumber) => (
                <div key={tableNumber} className="border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <h4 className="font-bold mb-2">Table {tableNumber}</h4>
                  <div className="flex flex-wrap justify-center gap-1">
                    {Array(8).fill(null).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-3 h-3 rounded-full ${i < 6 ? 'bg-present' : 'bg-absent'}`}
                        title={`Student ${i+1}`}
                      ></div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-present font-medium">6</span> / 
                    <span className="text-absent font-medium"> 2</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
        <section className="py-16 bg-white">
          
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-gray-600">Tables Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">120+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-gray-600">Tracking Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">Availability</div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </section>
  );
};

export default FeaturesSection;
