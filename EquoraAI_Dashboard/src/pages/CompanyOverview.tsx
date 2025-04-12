import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CompanyOverview from '@/components/dashboard/CompanyOverview';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const CompanyOverviewPage = () => {
  const [symbol, setSymbol] = useState<string>('IBM');
  const [inputSymbol, setInputSymbol] = useState<string>('IBM');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSymbol.trim()) {
      setSymbol(inputSymbol.trim().toUpperCase());
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Company Overview</h1>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <Input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            className="max-w-[240px]"
          />
          <Button type="submit" variant="default">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      <CompanyOverview symbol={symbol} />
    </DashboardLayout>
  );
};

export default CompanyOverviewPage; 