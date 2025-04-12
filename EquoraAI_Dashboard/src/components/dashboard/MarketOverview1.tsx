
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectorSentiment } from '@/services/sentimentService';
import { formatPercent, getSentimentClass, getSentimentColor } from '@/utils/formatters';
import { Progress } from '@/components/ui/progress';

// This is MarketOverview1.tsx from src/components/dashboard/MarketOverview1.tsx

interface DashboardStatsProps {
  lastPrice: number;
  sentiment: string;
  volume: number;
}

// const DashboardStats: React.FC<DashboardStatsProps> = ({ lastPrice, sentiment, volume }) => {
//   return (
//     <div className="grid grid-cols-3 gap-4">
//       <div>
//         <h3 className="text-sm font-semibold">Last Price</h3>
//         <p className="text-lg">{lastPrice}</p>
//       </div>
//       <div>
//         <h3 className="text-sm font-semibold">Sentiment</h3>
//         <p className="text-lg">{sentiment}</p>
//       </div>
//       <div>
//         <h3 className="text-sm font-semibold">Volume</h3>
//         <p className="text-lg">{volume}</p>
//       </div>
//     </div>
//   );
// };

const DashboardStats: React.FC<DashboardStatsProps> = ({ lastPrice, sentiment, volume }) => {
  return null; // Component now renders nothing
};

export default DashboardStats;
