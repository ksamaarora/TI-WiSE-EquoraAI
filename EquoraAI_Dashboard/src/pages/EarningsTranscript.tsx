import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EarningsTranscriptSection from '@/components/dashboard/EarningsTranscriptSection';

const EarningsTranscript: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Earnings Call Transcripts</h1>
          <p className="text-muted-foreground">
            Analyze and visualize company earnings call transcripts with sentiment analysis
          </p>
        </div>
        
        <EarningsTranscriptSection />
      </div>
    </DashboardLayout>
  );
};

export default EarningsTranscript; 