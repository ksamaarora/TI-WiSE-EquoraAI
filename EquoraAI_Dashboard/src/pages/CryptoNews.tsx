import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Newsy from '@/components/dashboard/Newsy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

const CryptoNews: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Crypto News Center</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest cryptocurrency news and insights
            </p>
          </div>
        </div>

        {/* News Display Section */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center text-2xl">
                <Newspaper className="mr-2" size={24} />
                <span>Comprehensive News Analysis</span>
              </CardTitle>
              <CardDescription>
                Filter, search, and analyze the latest cryptocurrency news with powerful tools
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-4">
              <Newsy maxItems={20} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CryptoNews; 