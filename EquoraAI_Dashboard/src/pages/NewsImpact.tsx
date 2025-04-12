import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NewsImpactDirect from '@/components/dashboard/NewsImpactDirect';
import AIAssistant from '@/components/dashboard/AIAssistant';

const NewsImpactPage = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">News Impact</h1>
      </div>

      {/* Direct implementation that uses the API exactly as in your example */}
      <NewsImpactDirect />
      
      <AIAssistant />
    </DashboardLayout>
  );
};

export default NewsImpactPage;
