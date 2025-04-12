import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePortfolio, PortfolioStock } from '@/services/portfolioService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Briefcase,
  Percent,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/lib/accessibility';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57'];

const StockForm: React.FC<{
  onSubmit: (stock: Omit<PortfolioStock, 'change' | 'changePercent' | 'lastUpdated'>) => void;
  initialValues?: Partial<PortfolioStock>;
  isEdit?: boolean;
}> = ({ onSubmit, initialValues = {}, isEdit = false }) => {
  const [formData, setFormData] = useState({
    symbol: initialValues.symbol || '',
    companyName: initialValues.companyName || '',
    shares: initialValues.shares || 0,
    purchasePrice: initialValues.purchasePrice || 0,
    currentPrice: initialValues.currentPrice || 0,
    sector: initialValues.sector || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'shares' || name === 'purchasePrice' || name === 'currentPrice' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSectorChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      sector: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="symbol">Stock Symbol</Label>
          <Input 
            id="symbol" 
            name="symbol" 
            value={formData.symbol} 
            onChange={handleChange} 
            placeholder="e.g. AAPL" 
            required
            readOnly={isEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input 
            id="companyName" 
            name="companyName" 
            value={formData.companyName} 
            onChange={handleChange} 
            placeholder="e.g. Apple Inc." 
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shares">Number of Shares</Label>
          <Input 
            id="shares" 
            name="shares" 
            type="number" 
            value={formData.shares} 
            onChange={handleChange} 
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Purchase Price</Label>
          <Input 
            id="purchasePrice" 
            name="purchasePrice" 
            type="number" 
            value={formData.purchasePrice} 
            onChange={handleChange} 
            min="0.01" 
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentPrice">Current Price</Label>
          <Input 
            id="currentPrice" 
            name="currentPrice" 
            type="number" 
            value={formData.currentPrice} 
            onChange={handleChange} 
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sector">Sector</Label>
          <Select 
            value={formData.sector} 
            onValueChange={handleSectorChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Financial">Financial</SelectItem>
              <SelectItem value="Consumer Cyclical">Consumer Cyclical</SelectItem>
              <SelectItem value="Communication Services">Communication Services</SelectItem>
              <SelectItem value="Industrials">Industrials</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Automotive">Automotive</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isEdit ? 'Update Stock' : 'Add Stock'}
      </Button>
    </form>
  );
};

const Portfolio: React.FC = () => {
  const { 
    portfolioStocks, 
    portfolioSummary, 
    loading, 
    error, 
    addStock, 
    updateStock, 
    removeStock, 
    refreshPrices 
  } = usePortfolio();
  
  const { speakText } = useAccessibility();
  const [editingStock, setEditingStock] = useState<PortfolioStock | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleAddStock = (stock: Omit<PortfolioStock, 'change' | 'changePercent' | 'lastUpdated'>) => {
    if (addStock(stock)) {
      setAddDialogOpen(false);
      speakText(`Added ${stock.shares} shares of ${stock.companyName} to portfolio`);
    }
  };

  const handleEditStock = (stock: Omit<PortfolioStock, 'change' | 'changePercent' | 'lastUpdated'>) => {
    if (updateStock(stock.symbol, stock)) {
      setEditDialogOpen(false);
      setEditingStock(null);
      speakText(`Updated ${stock.companyName} in your portfolio`);
    }
  };

  const handleDeleteStock = (symbol: string, companyName: string) => {
    if (confirm(`Are you sure you want to remove ${companyName} from your portfolio?`)) {
      removeStock(symbol);
      speakText(`Removed ${companyName} from your portfolio`);
    }
  };

  const handleRefresh = () => {
    refreshPrices();
    speakText('Refreshing portfolio prices');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Portfolio Management</h1>
            <p className="text-muted-foreground">Track and analyze your investments</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} />
              {loading ? "Refreshing..." : "Refresh Prices"}
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock to Portfolio</DialogTitle>
                </DialogHeader>
                <StockForm onSubmit={handleAddStock} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalValue)}</div>
              <div className="flex items-center mt-1">
                <span className={cn(
                  "text-sm",
                  portfolioSummary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {portfolioSummary.totalGainLoss >= 0 ? (
                    <TrendingUp size={14} className="inline mr-1" />
                  ) : (
                    <TrendingDown size={14} className="inline mr-1" />
                  )}
                  {formatCurrency(Math.abs(portfolioSummary.totalGainLoss))} ({formatPercent(portfolioSummary.totalGainLossPercent)})
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investment Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalInvestment)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                <DollarSign size={14} className="inline mr-1" />
                Cost basis for {portfolioStocks.length} holdings
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioSummary.topPerformer && (
                <>
                  <div className="text-2xl font-bold">{portfolioSummary.topPerformer.symbol}</div>
                  <div className="text-sm text-green-600 mt-1">
                    <TrendingUp size={14} className="inline mr-1" />
                    {formatPercent(portfolioSummary.topPerformer.changePercent)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Worst Performer</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioSummary.worstPerformer && (
                <>
                  <div className="text-2xl font-bold">{portfolioSummary.worstPerformer.symbol}</div>
                  <div className="text-sm text-red-600 mt-1">
                    <TrendingDown size={14} className="inline mr-1" />
                    {formatPercent(portfolioSummary.worstPerformer.changePercent)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Holdings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2" size={20} />
                  <span>Your Holdings</span>
                </CardTitle>
                <CardDescription>Manage your stock portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-3 px-2">Symbol</th>
                        <th className="py-3 px-2">Shares</th>
                        <th className="py-3 px-2">Price</th>
                        <th className="py-3 px-2">Value</th>
                        <th className="py-3 px-2">Gain/Loss</th>
                        <th className="py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioStocks.map((stock) => (
                        <tr key={stock.symbol} className="border-b hover:bg-secondary/30">
                          <td className="py-3 px-2">
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-xs text-muted-foreground">{stock.companyName}</div>
                          </td>
                          <td className="py-3 px-2">{stock.shares}</td>
                          <td className="py-3 px-2">
                            <div>{formatCurrency(stock.currentPrice)}</div>
                            <div className={cn(
                              "text-xs",
                              stock.change >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)}
                            </div>
                          </td>
                          <td className="py-3 px-2 font-medium">
                            {formatCurrency(stock.currentPrice * stock.shares)}
                          </td>
                          <td className={cn(
                            "py-3 px-2",
                            stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            <div className="flex items-center">
                              {stock.changePercent >= 0 ? (
                                <TrendingUp size={14} className="mr-1" />
                              ) : (
                                <TrendingDown size={14} className="mr-1" />
                              )}
                              {formatPercent(stock.changePercent)}
                            </div>
                            <div className="text-xs">
                              {formatCurrency(stock.change * stock.shares)}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex space-x-1">
                              <Dialog open={editDialogOpen && editingStock?.symbol === stock.symbol} onOpenChange={(open) => {
                                setEditDialogOpen(open);
                                if (!open) setEditingStock(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setEditingStock(stock);
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit {stock.symbol}</DialogTitle>
                                  </DialogHeader>
                                  {editingStock && (
                                    <StockForm 
                                      initialValues={editingStock} 
                                      onSubmit={handleEditStock} 
                                      isEdit 
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteStock(stock.symbol, stock.companyName)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sector Allocation */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="mr-2" size={20} />
                  <span>Sector Allocation</span>
                </CardTitle>
                <CardDescription>Diversity of your investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioSummary.sectorAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="percentage"
                        label={({ sector, percentage }) => `${sector}: ${percentage.toFixed(1)}%`}
                      >
                        {portfolioSummary.sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'Allocation']}
                        labelFormatter={(label) => `Sector: ${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {portfolioSummary.sectorAllocation.map((item, index) => (
                    <div key={item.sector} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.sector}</span>
                      </div>
                      <span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" size={20} />
              <span>Performance Overview</span>
            </CardTitle>
            <CardDescription>Value change by holding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={portfolioStocks.map(stock => ({
                    name: stock.symbol,
                    value: stock.change * stock.shares,
                    percentChange: stock.changePercent
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis dataKey="name" angle={-45} textAnchor="end" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Value Change']}
                    labelFormatter={(name) => {
                      const stock = portfolioStocks.find(s => s.symbol === name);
                      return stock ? stock.companyName : name;
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value"
                    name="$ Change" 
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio; 