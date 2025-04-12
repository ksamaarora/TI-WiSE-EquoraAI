import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Interface for the income statement data
interface AnnualReport {
  fiscalDateEnding: string;
  reportedCurrency: string;
  grossProfit: string;
  totalRevenue: string;
  costOfRevenue: string;
  costofGoodsAndServicesSold: string;
  operatingIncome: string;
  sellingGeneralAndAdministrative: string;
  researchAndDevelopment: string;
  operatingExpenses: string;
  investmentIncomeNet: string;
  netInterestIncome: string;
  interestIncome: string;
  interestExpense: string;
  nonInterestIncome: string;
  otherNonOperatingIncome: string;
  depreciation: string;
  depreciationAndAmortization: string;
  incomeBeforeTax: string;
  incomeTaxExpense: string;
  interestAndDebtExpense: string;
  netIncomeFromContinuingOperations: string;
  comprehensiveIncomeNetOfTax: string;
  ebit: string;
  ebitda: string;
  netIncome: string;
}

interface IncomeStatementData {
  symbol: string;
  annualReports: AnnualReport[];
}

interface IncomeStatementProps {
  symbol: string;
}

const IncomeStatement: React.FC<IncomeStatementProps> = ({ symbol }) => {
  const [incomeData, setIncomeData] = useState<IncomeStatementData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    const fetchIncomeStatementData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch data from Alpha Vantage API
        const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'ENVZWD4RMWCC6EVQ';
        const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${API_KEY}`;
        
        console.log("Fetching income statement data from:", url);
        
        const response = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        console.log("Income statement response:", response.data);
        
        // Check for error messages
        if (response.data.Note) {
          throw new Error(response.data.Note);
        }
        
        if (response.data["Error Message"]) {
          throw new Error(response.data["Error Message"]);
        }
        
        // Check if response is empty or doesn't have annual reports
        if (
          !response.data.annualReports || 
          !Array.isArray(response.data.annualReports) || 
          response.data.annualReports.length === 0
        ) {
          throw new Error("No income statement data found for this company");
        }
        
        // Update state with income statement data
        setIncomeData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error("Error fetching income statement data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIncomeStatementData();
  }, [symbol]);

  // Format values for display (convert to millions/billions)
  const formatValue = (value: string) => {
    if (value === 'None' || !value) return 0;
    
    const num = parseFloat(value);
    
    if (isNaN(num)) return 0;
    
    if (Math.abs(num) >= 1e9) {
      return +(num / 1e9).toFixed(2);
    } else if (Math.abs(num) >= 1e6) {
      return +(num / 1e6).toFixed(2);
    } else {
      return +num.toFixed(2);
    }
  };

  // Format label based on value size (B for billions, M for millions)
  const formatLabel = (value: string) => {
    if (value === 'None' || !value) return '$0';
    
    const num = parseFloat(value);
    
    if (isNaN(num)) return '$0';
    
    if (Math.abs(num) >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (Math.abs(num) >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  // Calculate profit margin
  const calculateMargin = (revenue: string, profit: string) => {
    if (revenue === 'None' || profit === 'None' || !revenue || !profit) return 0;
    
    const revenueNum = parseFloat(revenue);
    const profitNum = parseFloat(profit);
    
    if (isNaN(revenueNum) || isNaN(profitNum) || revenueNum === 0) return 0;
    
    return +(profitNum / revenueNum * 100).toFixed(2);
  };

  // Prepare data for revenue and profit trend chart
  const prepareRevenueProfitData = () => {
    if (!incomeData || !incomeData.annualReports) return [];
    
    return [...incomeData.annualReports]
      .sort((a, b) => a.fiscalDateEnding.localeCompare(b.fiscalDateEnding))
      .map(report => ({
        year: report.fiscalDateEnding.substring(0, 4),
        revenue: formatValue(report.totalRevenue),
        grossProfit: formatValue(report.grossProfit),
        operatingIncome: formatValue(report.operatingIncome),
        netIncome: formatValue(report.netIncome),
        grossMargin: calculateMargin(report.totalRevenue, report.grossProfit),
        operatingMargin: calculateMargin(report.totalRevenue, report.operatingIncome),
        netMargin: calculateMargin(report.totalRevenue, report.netIncome),
      }));
  };

  // Prepare data for expense breakdown chart
  const prepareExpenseData = () => {
    if (!incomeData || !incomeData.annualReports || incomeData.annualReports.length === 0) return [];
    
    // Get the most recent annual report
    const latestReport = incomeData.annualReports[0];
    
    return [
      {
        name: 'Cost of Revenue',
        value: formatValue(latestReport.costOfRevenue),
        label: formatLabel(latestReport.costOfRevenue)
      },
      {
        name: 'SG&A',
        value: formatValue(latestReport.sellingGeneralAndAdministrative),
        label: formatLabel(latestReport.sellingGeneralAndAdministrative)
      },
      {
        name: 'R&D',
        value: formatValue(latestReport.researchAndDevelopment),
        label: formatLabel(latestReport.researchAndDevelopment)
      },
      {
        name: 'D&A',
        value: formatValue(latestReport.depreciationAndAmortization),
        label: formatLabel(latestReport.depreciationAndAmortization)
      },
      {
        name: 'Interest',
        value: formatValue(latestReport.interestExpense),
        label: formatLabel(latestReport.interestExpense)
      }
    ].filter(item => item.value > 0);
  };

  // Prepare data for profitability metrics chart
  const prepareProfitabilityData = () => {
    if (!incomeData || !incomeData.annualReports) return [];
    
    return [...incomeData.annualReports]
      .sort((a, b) => a.fiscalDateEnding.localeCompare(b.fiscalDateEnding))
      .map(report => ({
        year: report.fiscalDateEnding.substring(0, 4),
        grossMargin: calculateMargin(report.totalRevenue, report.grossProfit),
        operatingMargin: calculateMargin(report.totalRevenue, report.operatingIncome),
        netMargin: calculateMargin(report.totalRevenue, report.netIncome),
        ebitdaMargin: calculateMargin(report.totalRevenue, report.ebitda)
      }));
  };

  // Prepare data for key metrics comparison
  const prepareKeyMetricsData = () => {
    if (!incomeData || !incomeData.annualReports) return [];
    
    return [...incomeData.annualReports]
      .sort((a, b) => a.fiscalDateEnding.localeCompare(b.fiscalDateEnding))
      .map(report => ({
        year: report.fiscalDateEnding.substring(0, 4),
        netIncome: formatValue(report.netIncome),
        operatingIncome: formatValue(report.operatingIncome),
        ebit: formatValue(report.ebit),
        ebitda: formatValue(report.ebitda)
      }));
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value >= 1e9 
                ? `$${(entry.value).toFixed(2)}B` 
                : entry.value >= 1e6 
                  ? `$${(entry.value).toFixed(2)}M` 
                  : `${entry.value}%`
              }
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };

  // Margin tooltip
  const MarginTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center p-6 h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading income statement data...</p>
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
          Failed to load income statement data: {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!incomeData) {
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No income statement data available for this company.
        </AlertDescription>
      </Alert>
    );
  }

  const revenueProfitData = prepareRevenueProfitData();
  const expenseData = prepareExpenseData();
  const profitabilityData = prepareProfitabilityData();
  const keyMetricsData = prepareKeyMetricsData();
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab - Revenue, Profit, and Key Metrics */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue & Profit Trend</CardTitle>
                <CardDescription>
                  Annual revenue and profit metrics (in {revenueProfitData[0]?.revenue >= 1 ? "billions" : "millions"})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueProfitData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                      <Bar dataKey="grossProfit" name="Gross Profit" fill="#82ca9d" />
                      <Bar dataKey="operatingIncome" name="Operating Income" fill="#ffc658" />
                      <Bar dataKey="netIncome" name="Net Income" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Financial Metrics</CardTitle>
                <CardDescription>
                  EBIT, EBITDA and income metrics (in {keyMetricsData[0]?.ebitda >= 1 ? "billions" : "millions"})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={keyMetricsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="ebit" name="EBIT" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="operatingIncome" name="Operating Income" stroke="#ffc658" />
                      <Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#ff8042" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Profitability Tab */}
        <TabsContent value="profitability" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Margin Analysis</CardTitle>
                <CardDescription>
                  Profitability margins over time (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={profitabilityData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip content={<MarginTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="grossMargin" name="Gross Margin" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="operatingMargin" name="Operating Margin" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="ebitdaMargin" name="EBITDA Margin" stroke="#ffc658" />
                      <Line type="monotone" dataKey="netMargin" name="Net Margin" stroke="#ff8042" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Year Margins</CardTitle>
                <CardDescription>
                  Most recent fiscal year profitability breakdown (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[profitabilityData[profitabilityData.length - 1]].map(data => ({
                        name: data.year,
                        grossMargin: data.grossMargin,
                        operatingMargin: data.operatingMargin,
                        ebitdaMargin: data.ebitdaMargin,
                        netMargin: data.netMargin
                      }))}
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'dataMax + 5']} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="grossMargin" name="Gross Margin" fill="#8884d8" />
                      <Bar dataKey="operatingMargin" name="Operating Margin" fill="#82ca9d" />
                      <Bar dataKey="ebitdaMargin" name="EBITDA Margin" fill="#ffc658" />
                      <Bar dataKey="netMargin" name="Net Margin" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                <CardDescription>
                  Latest fiscal year expense composition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`${props.payload.label}`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operating Expenses Trend</CardTitle>
                <CardDescription>
                  SG&A and R&D expenses over time (in {revenueProfitData[0]?.revenue >= 1 ? "billions" : "millions"})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[...incomeData.annualReports]
                        .sort((a, b) => a.fiscalDateEnding.localeCompare(b.fiscalDateEnding))
                        .map(report => ({
                          year: report.fiscalDateEnding.substring(0, 4),
                          SGA: formatValue(report.sellingGeneralAndAdministrative),
                          RD: formatValue(report.researchAndDevelopment),
                          DA: formatValue(report.depreciationAndAmortization)
                        }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="SGA" name="SG&A" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="RD" name="R&D" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="DA" name="D&A" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Rates</CardTitle>
                <CardDescription>
                  Year-over-year growth of key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const data = [...incomeData.annualReports]
                          .sort((a, b) => a.fiscalDateEnding.localeCompare(b.fiscalDateEnding));
                        
                        // Calculate YoY growth rates
                        return data.slice(1).map((report, i) => {
                          const prevReport = data[i];
                          const year = report.fiscalDateEnding.substring(0, 4);
                          
                          const calcGrowth = (current: string, previous: string) => {
                            const curr = parseFloat(current);
                            const prev = parseFloat(previous);
                            if (isNaN(curr) || isNaN(prev) || prev === 0) return 0;
                            return +((curr - prev) / prev * 100).toFixed(2);
                          };
                          
                          return {
                            year,
                            revenueGrowth: calcGrowth(report.totalRevenue, prevReport.totalRevenue),
                            grossProfitGrowth: calcGrowth(report.grossProfit, prevReport.grossProfit),
                            operatingIncomeGrowth: calcGrowth(report.operatingIncome, prevReport.operatingIncome),
                            netIncomeGrowth: calcGrowth(report.netIncome, prevReport.netIncome)
                          };
                        });
                      })()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenueGrowth" name="Revenue Growth %" fill="#8884d8" />
                      <Bar dataKey="grossProfitGrowth" name="Gross Profit Growth %" fill="#82ca9d" />
                      <Bar dataKey="operatingIncomeGrowth" name="Operating Income Growth %" fill="#ffc658" />
                      <Bar dataKey="netIncomeGrowth" name="Net Income Growth %" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Annual Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Annual Income Statement Data</CardTitle>
          <CardDescription>
            Latest {incomeData.annualReports.length} years of financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 font-medium">Fiscal Year</th>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <th key={report.fiscalDateEnding} className="text-right p-2 font-medium">
                        {report.fiscalDateEnding.substring(0, 4)}
                      </th>
                    ))
                  }
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2 font-medium">Total Revenue</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.totalRevenue)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">Cost of Revenue</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.costOfRevenue)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-2 font-medium">Gross Profit</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2 font-medium">
                        {formatLabel(report.grossProfit)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">SG&A</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.sellingGeneralAndAdministrative)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">R&D</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.researchAndDevelopment)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">D&A</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.depreciationAndAmortization)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-2 font-medium">Operating Income</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2 font-medium">
                        {formatLabel(report.operatingIncome)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">Interest Expense</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.interestExpense)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">Income Before Tax</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.incomeBeforeTax)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">Income Tax</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.incomeTaxExpense)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-2 font-medium">Net Income</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2 font-medium">
                        {formatLabel(report.netIncome)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">EBIT</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.ebit)}
                      </td>
                    ))
                  }
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-medium">EBITDA</td>
                  {incomeData.annualReports
                    .sort((a, b) => b.fiscalDateEnding.localeCompare(a.fiscalDateEnding))
                    .map(report => (
                      <td key={report.fiscalDateEnding} className="text-right p-2">
                        {formatLabel(report.ebitda)}
                      </td>
                    ))
                  }
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeStatement; 