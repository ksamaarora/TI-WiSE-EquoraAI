import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const TestPage: React.FC = () => {
  console.log("TestPage is rendering");
  
  return (
    <DashboardLayout>
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p>If you can see this page, the routing and layout are working correctly.</p>
      </div>
    </DashboardLayout>
  );
};

export default TestPage; 