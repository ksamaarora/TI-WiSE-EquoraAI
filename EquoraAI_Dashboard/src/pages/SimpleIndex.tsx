import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const SimpleIndex: React.FC = () => {
  console.log("SimpleIndex is rendering");
  
  return (
    <DashboardLayout>
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-4">Simplified Dashboard</h1>
        <p className="mb-4">This is a simplified version of the dashboard to troubleshoot rendering issues.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(item => (
            <div key={item} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Card {item}</h2>
              <p>Sample content for dashboard card</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SimpleIndex; 