import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlobalMarketStatusSection from '@/components/dashboard/GlobalMarketStatusSection';

const GlobalMarketStatus: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Global Market Status</h1>
          <p className="text-muted-foreground">
            Real-time status and trading hours of markets worldwide
          </p>
        </div>
        
        <GlobalMarketStatusSection />
      </div>
    </DashboardLayout>
  );
};

export default GlobalMarketStatus; 