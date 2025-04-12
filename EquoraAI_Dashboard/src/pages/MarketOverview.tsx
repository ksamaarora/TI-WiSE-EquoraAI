
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SectorAnalysis from '@/components/dashboard/MarketOverview1';
import AIAssistant from '@/components/dashboard/AIAssistant';
import { sentimentService } from '@/services/sentimentService';
import { useEffect, useState } from 'react';

import { getIntradayData } from '@/services/marketDataService';

import MultiSymbolChart from '@/components/dashboard/MultiSymbolChart';

const symbols = [
  "AAPL",   // Apple
  "MSFT",   // Microsoft
  "AMZN",   // Amazon
  "GOOG",  // Alphabet (using GOOG is an option too)
];

const MarketOverview: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("IBM");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Market Overview</h1>
      <div className="mb-4">
        {symbols.map((sym) => (
          <button
            key={sym}
            onClick={() => setSelectedSymbol(sym)}
            className={`m-2 px-4 py-2 border rounded ${
              selectedSymbol === sym ? "bg-blue-500 text-white" : "bg-white text-black"
            }`}
          >
            {sym}
          </button>
        ))}
      </div>
      <MultiSymbolChart symbol={selectedSymbol} />
    </div>
  );
};

export default MarketOverview;


// src/pages/MarketOverview.tsx
// import React, { useState } from 'react';
// import MultiSymbolChart from '@/components/dashboard/MultiSymbolChart';

// const symbols = [
//   "AAPL", "MSFT", "AMZN", "GOOGL", "META",
//   "TSLA", "NFLX", "NVDA", "IBM", "INTC", "CSCO"
// ];

// const timeFrames: Array<{ label: string, value: 'daily' | 'weekly' | 'monthly' }> = [
//   { label: 'Daily', value: 'daily' },
//   { label: 'Weekly', value: 'weekly' },
//   { label: 'Monthly', value: 'monthly' }
// ];

// const MarketOverview: React.FC = () => {
//   const [selectedSymbol, setSelectedSymbol] = useState<string>("IBM");
//   const [selectedTimeFrame, setSelectedTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Market Overview</h1>
//       <div className="mb-4">
//         <h3 className="text-lg font-semibold mb-2">Select Symbol:</h3>
//         <div className="flex flex-wrap">
//           {symbols.map((sym) => (
//             <button
//               key={sym}
//               onClick={() => setSelectedSymbol(sym)}
//               className={`m-2 px-4 py-2 border rounded ${
//                 selectedSymbol === sym ? "bg-blue-500 text-white" : "bg-white text-black"
//               }`}
//             >
//               {sym}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div className="mb-4">
//         <h3 className="text-lg font-semibold mb-2">Select Time Frame:</h3>
//         <div className="flex flex-wrap">
//           {timeFrames.map((tf) => (
//             <button
//               key={tf.value}
//               onClick={() => setSelectedTimeFrame(tf.value)}
//               className={`m-2 px-4 py-2 border rounded ${
//                 selectedTimeFrame === tf.value ? "bg-green-500 text-white" : "bg-white text-black"
//               }`}
//             >
//               {tf.label}
//             </button>
//           ))}
//         </div>
//       </div>
//       <MultiSymbolChart symbol={selectedSymbol} timeFrame={selectedTimeFrame} />
//     </div>
//   );
// };

// export default MarketOverview;
