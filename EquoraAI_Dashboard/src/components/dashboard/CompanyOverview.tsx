import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ExternalLink, Building2, TrendingUp, DollarSign, Briefcase, Globe, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import IncomeStatement from './IncomeStatement';
import HistoricalOptions from './HistoricalOptions';

// Interface for the company overview data
interface CompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  OfficialSite: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  AnalystRatingStrongBuy: string;
  AnalystRatingBuy: string;
  AnalystRatingHold: string;
  AnalystRatingSell: string;
  AnalystRatingStrongSell: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
}

interface CompanyOverviewProps {
  symbol?: string;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ symbol = 'IBM' }) => {
  const [companyData, setCompanyData] = useState<CompanyOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch data from Alpha Vantage API
        const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'ENVZWD4RMWCC6EVQ';
        const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
        
        console.log("Fetching company data from:", url);
        
        const response = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        console.log("Company data response:", response.data);
        
        // Check for error messages
        if (response.data.Note) {
          throw new Error(response.data.Note);
        }
        
        if (response.data["Error Message"]) {
          throw new Error(response.data["Error Message"]);
        }
        
        // Check if response is empty
        if (Object.keys(response.data).length === 0) {
          throw new Error("No data found for this company symbol");
        }
        
        // Update state with company data
        setCompanyData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error("Error fetching company data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [symbol]);
  
  // Format market cap as millions/billions/trillions
  const formatMarketCap = (marketCap: string) => {
    const num = parseInt(marketCap);
    if (isNaN(num)) return 'N/A';
    
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };
  
  // Format percentage values
  const formatPercentage = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
    
    return `${(num * 100).toFixed(2)}%`;
  };
  
  // Format currency values
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
    
    return `$${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Calculate total analyst ratings
  const getTotalAnalystRatings = () => {
    if (!companyData) return 0;
    
    return parseInt(companyData.AnalystRatingStrongBuy || '0') +
           parseInt(companyData.AnalystRatingBuy || '0') +
           parseInt(companyData.AnalystRatingHold || '0') +
           parseInt(companyData.AnalystRatingSell || '0') +
           parseInt(companyData.AnalystRatingStrongSell || '0');
  };
  
  // Calculate percentage of each analyst rating
  const getAnalystRatingPercentage = (rating: string) => {
    if (!companyData) return 0;
    
    const totalRatings = getTotalAnalystRatings();
    if (totalRatings === 0) return 0;
    
    return (parseInt(rating || '0') / totalRatings) * 100;
  };
  
  // Calculate current price position in 52-week range
  const getPricePositionIn52WeekRange = () => {
    if (!companyData) return 0;
    
    const high = parseFloat(companyData['52WeekHigh'] || '0');
    const low = parseFloat(companyData['52WeekLow'] || '0');
    const current = parseFloat(companyData['50DayMovingAverage'] || '0');
    
    if (high === low) return 50;
    
    return ((current - low) / (high - low)) * 100;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center p-6 h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading company data...</p>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load company data: {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!companyData) {
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No data available for this company.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {companyData.Name} ({companyData.Symbol})
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {companyData.Exchange} • {companyData.Currency} • {companyData.Country}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">
                {companyData['50DayMovingAverage'] ? formatCurrency(companyData['50DayMovingAverage']) : 'N/A'}
              </div>
              <CardDescription className="text-sm">
                Market Cap: {formatMarketCap(companyData.MarketCapitalization)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2">
              <h3 className="font-medium mb-2">Company Description</h3>
              <p className="text-sm text-muted-foreground">{companyData.Description}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a 
                  href={companyData.OfficialSite} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  <Globe className="h-4 w-4 mr-1" /> Official Website <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                <span className="text-sm flex items-center">
                  <Building2 className="h-4 w-4 mr-1" /> {companyData.Sector} / {companyData.Industry}
                </span>
                <span className="text-sm flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" /> CIK: {companyData.CIK}
                </span>
                <span className="text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Fiscal Year End: {companyData.FiscalYearEnd}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">52-Week Range</h3>
              <div className="space-y-2">
                <div className="text-sm text-right text-muted-foreground">High: {formatCurrency(companyData['52WeekHigh'])}</div>
                <Progress value={getPricePositionIn52WeekRange()} className="h-2" />
                <div className="text-sm text-left text-muted-foreground">Low: {formatCurrency(companyData['52WeekLow'])}</div>
              </div>
              
              <h3 className="font-medium mt-4 mb-2">Analyst Ratings</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Strong Sell</span>
                  <span>Strong Buy</span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                    className="bg-red-500 h-full" 
                    style={{ width: `${getAnalystRatingPercentage(companyData.AnalystRatingStrongSell)}%` }}
                  ></div>
                  <div 
                    className="bg-orange-400 h-full" 
                    style={{ width: `${getAnalystRatingPercentage(companyData.AnalystRatingSell)}%` }}
                  ></div>
                  <div 
                    className="bg-yellow-400 h-full" 
                    style={{ width: `${getAnalystRatingPercentage(companyData.AnalystRatingHold)}%` }}
                  ></div>
                  <div 
                    className="bg-lime-400 h-full" 
                    style={{ width: `${getAnalystRatingPercentage(companyData.AnalystRatingBuy)}%` }}
                  ></div>
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${getAnalystRatingPercentage(companyData.AnalystRatingStrongBuy)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Target: {formatCurrency(companyData.AnalystTargetPrice)}</span>
                  <span>Total: {getTotalAnalystRatings()} analysts</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Tabs - Company Overview & Income Statement */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="valuations">Valuations</TabsTrigger>
          <TabsTrigger value="dividends">Dividends</TabsTrigger>
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>
        
        {/* Company Overview Tabs */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Market Cap</p>
                  <p className="text-xl font-semibold">{formatMarketCap(companyData.MarketCapitalization)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Revenue (TTM)</p>
                  <p className="text-xl font-semibold">{formatMarketCap(companyData.RevenueTTM)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">EBITDA</p>
                  <p className="text-xl font-semibold">{formatMarketCap(companyData.EBITDA)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">EPS (TTM)</p>
                  <p className="text-xl font-semibold">{formatCurrency(companyData.DilutedEPSTTM)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">PE Ratio</p>
                  <p className="text-xl font-semibold">{companyData.PERatio}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Beta</p>
                  <p className="text-xl font-semibold">{companyData.Beta}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-base">{companyData.Address}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Latest Quarter</p>
                  <p className="text-base">{companyData.LatestQuarter}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Share Count</p>
                  <p className="text-base">{parseInt(companyData.SharesOutstanding).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Financials Tab */}
        <TabsContent value="financials" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Revenue (TTM)</p>
                  <p className="text-xl font-semibold">{formatMarketCap(companyData.RevenueTTM)}</p>
                  <p className="text-xs text-muted-foreground">
                    QoQ Growth: {formatPercentage(companyData.QuarterlyRevenueGrowthYOY)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">EBITDA</p>
                  <p className="text-xl font-semibold">{formatMarketCap(companyData.EBITDA)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Gross Profit (TTM)</p>
                  <p className="text-xl font-semibold">{formatMarketCap(companyData.GrossProfitTTM)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">EPS (Diluted)</p>
                  <p className="text-xl font-semibold">{formatCurrency(companyData.DilutedEPSTTM)}</p>
                  <p className="text-xs text-muted-foreground">
                    QoQ Growth: {formatPercentage(companyData.QuarterlyEarningsGrowthYOY)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Profit Margin</p>
                  <p className="text-xl font-semibold">{formatPercentage(companyData.ProfitMargin)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Operating Margin</p>
                  <p className="text-xl font-semibold">{formatPercentage(companyData.OperatingMarginTTM)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Return on Assets</p>
                  <p className="text-xl font-semibold">{formatPercentage(companyData.ReturnOnAssetsTTM)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Return on Equity</p>
                  <p className="text-xl font-semibold">{formatPercentage(companyData.ReturnOnEquityTTM)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Revenue Per Share</p>
                  <p className="text-xl font-semibold">{formatCurrency(companyData.RevenuePerShareTTM)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Valuations Tab */}
        <TabsContent value="valuations" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">PE Ratios</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Trailing PE</span>
                      <span className="font-medium">{companyData.TrailingPE}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Forward PE</span>
                      <span className="font-medium">{companyData.ForwardPE}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">PEG Ratio</span>
                      <span className="font-medium">{companyData.PEGRatio}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Price Ratios</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Price/Sales</span>
                      <span className="font-medium">{companyData.PriceToSalesRatioTTM}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Price/Book</span>
                      <span className="font-medium">{companyData.PriceToBookRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Book Value</span>
                      <span className="font-medium">{formatCurrency(companyData.BookValue)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Enterprise Value Ratios</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">EV/Revenue</span>
                      <span className="font-medium">{companyData.EVToRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">EV/EBITDA</span>
                      <span className="font-medium">{companyData.EVToEBITDA}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Dividends & Growth Tab */}
        <TabsContent value="dividends" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Dividend Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dividend per Share</span>
                      <span className="font-medium">{formatCurrency(companyData.DividendPerShare)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dividend Yield</span>
                      <span className="font-medium">{formatPercentage(companyData.DividendYield)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ex-Dividend Date</span>
                      <span className="font-medium">{companyData.ExDividendDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Next Dividend Date</span>
                      <span className="font-medium">{companyData.DividendDate}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Growth Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Quarterly Earnings Growth (YoY)</span>
                        <span className={`font-medium ${
                          parseFloat(companyData.QuarterlyEarningsGrowthYOY) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatPercentage(companyData.QuarterlyEarningsGrowthYOY)}
                        </span>
                      </div>
                      <Progress 
                        value={
                          parseFloat(companyData.QuarterlyEarningsGrowthYOY) >= 0 
                            ? parseFloat(companyData.QuarterlyEarningsGrowthYOY) * 100
                            : 0
                        } 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Quarterly Revenue Growth (YoY)</span>
                        <span className={`font-medium ${
                          parseFloat(companyData.QuarterlyRevenueGrowthYOY) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatPercentage(companyData.QuarterlyRevenueGrowthYOY)}
                        </span>
                      </div>
                      <Progress 
                        value={
                          parseFloat(companyData.QuarterlyRevenueGrowthYOY) >= 0 
                            ? parseFloat(companyData.QuarterlyRevenueGrowthYOY) * 100
                            : 0
                        } 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Income Statement Tab */}
        <TabsContent value="income" className="mt-0">
          <IncomeStatement symbol={symbol} />
        </TabsContent>
        
        {/* Options Tab */}
        <TabsContent value="options" className="mt-0">
          <HistoricalOptions symbol={symbol} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyOverview; 