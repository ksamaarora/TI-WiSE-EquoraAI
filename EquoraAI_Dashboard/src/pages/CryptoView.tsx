import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CryptoViewSection from '@/components/dashboard/CryptoViewSection';

const CryptoView: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Crypto Market Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive cryptocurrency market data and insights
          </p>
        </div>
        
        <CryptoViewSection />
      </div>
    </DashboardLayout>
  );
};

export default CryptoView; 