import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getIntradayData } from '@/services/marketDataService';

interface DataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MultiSymbolChartProps {
  symbol: string;
}

const MultiSymbolChart: React.FC<MultiSymbolChartProps> = ({ symbol }) => {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const result = await getIntradayData(symbol);
        // Process the "Time Series (5min)" portion of the API response
        const timeSeries = result["Time Series (5min)"];
        const processedData: DataPoint[] = Object.keys(timeSeries).map((timestamp) => {
          const data = timeSeries[timestamp];
          return {
            timestamp,
            open: parseFloat(data["1. open"]),
            high: parseFloat(data["2. high"]),
            low: parseFloat(data["3. low"]),
            close: parseFloat(data["4. close"]),
            volume: parseInt(data["5. volume"], 10),
          };
        });
        // Sort data chronologically
        processedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setChartData(processedData);
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();

    // Optionally refetch every minute for live updates
    const intervalId = setInterval(fetchChartData, 60000);
    return () => clearInterval(intervalId);
  }, [symbol]);

  if (loading) return <p>Loading chart data for {symbol}...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Market Data for {symbol}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="open" stroke="#8884d8" name="Open" dot={false} />
          <Line type="monotone" dataKey="high" stroke="#82ca9d" name="High" dot={false} />
          <Line type="monotone" dataKey="low" stroke="#ff7300" name="Low" dot={false} />
          <Line type="monotone" dataKey="close" stroke="#ff0000" name="Close" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiSymbolChart;


// src/components/dashboard/MultiSymbolChart.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
// import { getMarketData } from '@/services/marketDataService';

// interface DataPoint {
//   timestamp: string;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume: number;
// }

// interface MultiSymbolChartProps {
//   symbol: string;
//   timeFrame: 'daily' | 'weekly' | 'monthly';
// }

// const MultiSymbolChart: React.FC<MultiSymbolChartProps> = ({ symbol, timeFrame }) => {
//   const [chartData, setChartData] = useState<DataPoint[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchChartData = async () => {
//       setLoading(true);
//       try {
//         const result = await getMarketData(symbol, timeFrame);
//         // Determine the correct key for the time series data
//         let timeSeriesKey = '';
//         if (timeFrame === 'daily') {
//           timeSeriesKey = "Time Series (Daily)";
//         } else if (timeFrame === 'weekly') {
//           timeSeriesKey = "Weekly Time Series";
//         } else if (timeFrame === 'monthly') {
//           timeSeriesKey = "Monthly Time Series";
//         }
//         const timeSeries = result[timeSeriesKey];
//         if (!timeSeries) throw new Error("Time series data not found");

//         const processedData: DataPoint[] = Object.keys(timeSeries).map((timestamp) => {
//           const data = timeSeries[timestamp];
//           return {
//             timestamp,
//             open: parseFloat(data["1. open"]),
//             high: parseFloat(data["2. high"]),
//             low: parseFloat(data["3. low"]),
//             close: parseFloat(data["4. close"]),
//             volume: parseInt(data["5. volume"], 10),
//           };
//         });
//         // Sort data chronologically (oldest first)
//         processedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
//         setChartData(processedData);
//       } catch (error) {
//         setError('Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChartData();

//     // Optionally refetch periodically (e.g., every minute)
//     const intervalId = setInterval(fetchChartData, 60000);
//     return () => clearInterval(intervalId);
//   }, [symbol, timeFrame]);

//   if (loading) return <p>Loading chart data for {symbol}...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">
//         Market Data for {symbol} ({timeFrame})
//       </h2>
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="open" stroke="#8884d8" name="Open" dot={false} />
//           <Line type="monotone" dataKey="high" stroke="#82ca9d" name="High" dot={false} />
//           <Line type="monotone" dataKey="low" stroke="#ff7300" name="Low" dot={false} />
//           <Line type="monotone" dataKey="close" stroke="#ff0000" name="Close" dot={false} />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default MultiSymbolChart;
