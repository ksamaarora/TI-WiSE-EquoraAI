import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SentimentOverview from '@/components/dashboard/SentimentOverview';
import SentimentChart from '@/components/dashboard/SentimentChart';
import SectorAnalysis from '@/components/dashboard/MarketOverview1';
import TopStocks from '@/components/dashboard/TopStocks';
import NewsImpact from '@/components/dashboard/NewsImpact';
import MarketBreadth from '@/components/dashboard/MarketBreadth';
import TechnicalIndicators from '@/components/dashboard/TechnicalIndicators';
import GlobalMarkets from '@/components/dashboard/GlobalMarkets';
import PriceCorrelation from '@/components/dashboard/PriceCorrelation';
import SentimentPrediction from '@/components/dashboard/SentimentPrediction';
import ClusterAnalysis from '@/components/dashboard/ClusterAnalysis';
import AIAssistant from '@/components/dashboard/AIAssistant';
import GeoLocationMap from '@/components/dashboard/GeoLocationMap';
import FinanceMemes from '@/components/dashboard/FinanceMemes';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import { sentimentService, SentimentData } from '@/services/sentimentService';
import { formatDate } from '@/utils/formatters';
import { motion } from 'framer-motion';
import { testApiConnection } from '@/utils/testApi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import NewsletterDialog from '@/components/layout/NewsletterDialog';

// Debug component for development only
const DevTools = () => {
  // Only show in development
  if (import.meta.env.MODE !== 'development') return null;

  const handleTestApi = async () => {
    try {
      const result = await testApiConnection();
      if (result) {
        toast.success('API connection working correctly');
      } else {
        toast.error('API connection test failed');
      }
    } catch (error) {
      console.error('API test error:', error);
      toast.error('API connection test failed with error');
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        zIndex: 1000,
        opacity: 0.7
      }}
    >
      <button
        onClick={handleTestApi}
        style={{
          background: '#333',
          color: '#fff',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Test API
      </button>
    </div>
  );
};

const Index = () => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  useEffect(() => {
    // Subscribe to sentiment data updates
    const unsubscribe = sentimentService.subscribe(newData => {
      setData(newData);
      setLoading(false);
    });
    
    // Start real-time updates
    const stopUpdates = sentimentService.startRealTimeUpdates(60000); // Update every minute
    
    // Initial data fetch
    const fetchInitialData = async () => {
      await sentimentService.fetchLatestData();
    };
    
    fetchInitialData();
    
    // Clean up on component unmount
    return () => {
      unsubscribe();
      stopUpdates();
    };
  }, []);
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Equora.AI Dashboard</h1>
          <p className="text-muted-foreground">
            {data ? (
              `Last updated: ${formatDate(data.timestamp)}`
            ) : (
              'Loading data...'
            )}
          </p>
        </div>
        {data && (
          <div className="flex items-center space-x-2">
            <div className="text-xl font-medium">{data.marketIndex}</div>
            <div className={`px-2 py-1 rounded-md text-white ${
              data.percentChange >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {data.percentChange >= 0 ? '+' : ''}{data.percentChange.toFixed(2)}%
            </div>
          </div>
        )}
      </div>
      
      {/* Overview Cards */}
      <SentimentOverview data={data} loading={loading} />
      
      {/* Charts */}
      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {data && (
              <SentimentChart data={data.sentimentTrend} loading={loading} />
            )}
          </div>
          <div>
            {data && (
              <SectorAnalysis 
                lastPrice={data.currentValue} 
                sentiment={data.overallSentiment > 0.3 ? "bullish" : data.overallSentiment < -0.3 ? "bearish" : "neutral"} 
                volume={data.volume} 
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Geo Location Map */}
      <div className="mt-8">
        <GeoLocationMap loading={loading} />
      </div>
      
      {/* Prediction Analysis */}
      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data && (
            <>
              <SentimentPrediction 
                historicalData={data.sentimentPrediction.historicalData.map(point => ({
                  date: point.date,
                  actual: point.actual,
                  predicted: point.predicted || 0,
                  lower: point.lower || 0,
                  upper: point.upper || 0
                }))}
                predictions={data.sentimentPrediction.predictions.map(point => ({
                  date: point.date,
                  actual: 0,
                  predicted: point.predicted,
                  lower: point.lower,
                  upper: point.upper
                }))}
                confidenceLevel={data.sentimentPrediction.confidenceLevel}
                loading={loading}
              />
              <PriceCorrelation 
                stocks={data.priceCorrelation.stocks}
                loading={loading}
              />
            </>
          )}
        </div>
      </div>
      
      {/* Technical Analysis Section */}
      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data && (
            <>
              <MarketBreadth data={data.marketBreadth} loading={loading} />
              <TechnicalIndicators 
                data={data.technicalIndicators} 
                currentValue={data.currentValue}
                loading={loading} 
              />
            </>
          )}
        </div>
      </div>
      
      {/* Cluster Analysis */}
      <div className="mt-8">
        {data && (
          <ClusterAnalysis
            stocks={data.clusterAnalysis.stocks}
            loading={loading}
          />
        )}
      </div>
      
      {/* Global Markets Section */}
      <div className="mt-8">
        {data && (
          <GlobalMarkets markets={data.globalMarkets} loading={loading} />
        )}
      </div>
      
      {/* Stock and News */}
      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {data && (
              <>
                <TopStocks stocks={data.topStocks} loading={loading} />
                <NewsImpact tickers="AAPL,MSFT,GOOGL,AMZN,META" />
              </>
            )}
          </div>
          <div className="space-y-6">
            {/* Newsletter Subscription Button */}
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Mail className="h-10 w-10 text-blue-600" />
                <h3 className="text-xl font-medium">Market Insights Newsletter</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Stay updated with our AI-powered market analysis delivered straight to your inbox.
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => setNewsletterOpen(true)}
                >
                  Subscribe to Newsletter
                </Button>
              </div>
            </div>
            <UpcomingEvents loading={loading} />
          </div>
        </div>
      </div>
      
      {/* Finance Memes Section with Animation */}
      <motion.div 
        className="mt-12 mb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          delay: 0.2
        }}
      >
        <FinanceMemes />
      </motion.div>
      
      {/* AI Assistant (floats on all pages) */}
      <AIAssistant />
      
      {/* Newsletter dialog */}
      <NewsletterDialog 
        open={newsletterOpen}
        onOpenChange={setNewsletterOpen}
      />
      
      {/* Dev tools for testing */}
      <DevTools />
    </DashboardLayout>
  );
};

export default Index;
