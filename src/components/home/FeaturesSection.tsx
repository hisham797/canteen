import React from 'react';
import { motion } from 'framer-motion';
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="features-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform provides powerful tools to manage canteen attendance efficiently and effectively.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="card-hover border border-gray-200">
                <CardHeader>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-4xl mb-4"
                  >
                    {feature.icon}
                  </motion.div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 bg-gray-50 rounded-2xl p-8 shadow-sm"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Table Visualization</h3>
            <p className="text-gray-600">See how the tables are organized and track attendance status.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((tableNumber) => (
                <motion.div
                  key={tableNumber}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * tableNumber }}
                  className="border border-gray-200 rounded-lg p-4 text-center shadow-sm"
                >
                  <h4 className="font-bold mb-2">Table {tableNumber}</h4>
                  <div className="flex flex-wrap justify-center gap-1">
                    {Array(8).fill(null).map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.05 * i }}
                        className={`w-3 h-3 rounded-full ${i < 6 ? 'bg-present' : 'bg-absent'}`}
                        title={`Student ${i+1}`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-present font-medium">6</span> / 
                    <span className="text-absent font-medium"> 2</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-16 bg-white"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '15+', label: 'Tables Managed' },
                { value: '120+', label: 'Students' },
                { value: '98%', label: 'Tracking Accuracy' },
                { value: '24/7', label: 'Availability' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </section>
  );
};

export default FeaturesSection;
