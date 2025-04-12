import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFinancialPlanning } from '@/services/financialPlanningService';
import { useAccessibility } from '@/lib/accessibility';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Import UI components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Import icons
import {
  PieChart,
  TrendingUp,
  User,
  DollarSign,
  Clock,
  Target,
  LineChart,
  BarChart,
  Sliders,
  PlusCircle,
  Edit,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Save
} from 'lucide-react';

// Asset allocation chart component
const AssetAllocationChart: React.FC<{ allocation: { stocks: number; bonds: number; cash: number; alternatives: number } }> = ({ allocation }) => {
  const data = [
    { name: 'Stocks', value: allocation.stocks, color: '#3b82f6' },
    { name: 'Bonds', value: allocation.bonds, color: '#8b5cf6' },
    { name: 'Cash', value: allocation.cash, color: '#22c55e' },
    { name: 'Alternatives', value: allocation.alternatives, color: '#f97316' }
  ];
  
  // Calculate cumulative percentages for positioning
  let cumulative = 0;
  const segments = data.map(item => {
    const start = cumulative;
    cumulative += item.value;
    return {
      ...item,
      start,
      end: cumulative
    };
  });
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {segments.map((segment, i) => {
            // Convert percentages to radians
            const startAngle = (segment.start / 100) * 2 * Math.PI - Math.PI / 2;
            const endAngle = (segment.end / 100) * 2 * Math.PI - Math.PI / 2;
            
            // Calculate coordinates
            const x1 = 50 + 40 * Math.cos(startAngle);
            const y1 = 50 + 40 * Math.sin(startAngle);
            const x2 = 50 + 40 * Math.cos(endAngle);
            const y2 = 50 + 40 * Math.sin(endAngle);
            
            // Determine if the arc should be drawn as large or small
            const largeArcFlag = segment.value > 50 ? 1 : 0;
            
            return (
              <path
                key={segment.name}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={segment.color}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-sm">
              {item.name} ({item.value}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Risk level visualization component
const RiskLevelIndicator: React.FC<{ level: number }> = ({ level }) => {
  const getColorClass = (value: number, current: number) => {
    if (value > current) return 'bg-gray-200';
    if (value <= 3) return 'bg-green-500';
    if (value <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted-foreground">Low Risk</span>
        <span className="text-xs text-muted-foreground">High Risk</span>
      </div>
      <div className="flex gap-1 h-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
          <div
            key={value}
            className={cn(
              "flex-1 rounded-sm",
              getColorClass(value, level)
            )}
          ></div>
        ))}
      </div>
      <div className="mt-1 text-center text-sm">
        Risk Level: {level}/10
      </div>
    </div>
  );
};

// Investment opportunity card component
const InvestmentCard: React.FC<{ 
  type: string; 
  name: string; 
  ticker: string; 
  price: number; 
  recommendation: string; 
  potentialReturn: number; 
  sector: string;
  rationale: string;
}> = ({ 
  type, 
  name, 
  ticker, 
  price, 
  recommendation, 
  potentialReturn, 
  sector,
  rationale
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'buy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'avoid': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return '';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{ticker}</span>
              <Badge variant="outline" className="text-xs capitalize">{type}</Badge>
            </div>
            <CardTitle className="text-base mt-1">{name}</CardTitle>
          </div>
          <Badge className={cn("uppercase", getRecommendationColor(recommendation))}>
            {recommendation}
          </Badge>
        </div>
        <CardDescription className="text-xs mt-1">
          Sector: {sector}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex justify-between">
          <div>
            <div className="text-2xl font-bold">${price.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Current Price</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium text-green-600">+{potentialReturn.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Potential Return</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          className="w-full justify-center text-sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Analysis'}
        </Button>
      </CardFooter>
      
      {showDetails && (
        <div className="px-6 pb-4 pt-0">
          <div className="text-sm border-t pt-3">
            <h4 className="font-medium mb-1">Investment Rationale</h4>
            <p className="text-muted-foreground">{rationale}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

// Profile form component
const ProfileForm: React.FC<{ 
  profile: any; 
  onSubmit: (profile: any) => void;
  isNewProfile?: boolean;
}> = ({ profile, onSubmit, isNewProfile = false }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age || 35,
    income: profile?.income || 80000,
    liquidAssets: profile?.liquidAssets || 50000,
    retirement: profile?.retirement || 100000,
    riskTolerance: profile?.riskTolerance || 'moderate',
    investmentHorizon: profile?.investmentHorizon || 15,
    goals: profile?.goals || [
      {
        id: `goal_${Date.now()}`,
        name: 'Retirement',
        targetAmount: 1000000,
        currentAmount: 100000,
        targetDate: '2050-01-01',
        priority: 'high'
      }
    ]
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value[0]
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...(profile || {}),
      ...formData
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Profile Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={18}
              max={100}
              value={formData.age}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="income">Annual Income ($)</Label>
            <Input
              id="income"
              name="income"
              type="number"
              min={0}
              value={formData.income}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="liquidAssets">Liquid Assets ($)</Label>
            <Input
              id="liquidAssets"
              name="liquidAssets"
              type="number"
              min={0}
              value={formData.liquidAssets}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="retirement">Retirement Savings ($)</Label>
            <Input
              id="retirement"
              name="retirement"
              type="number"
              min={0}
              value={formData.retirement}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="riskTolerance">Risk Tolerance</Label>
          <Select 
            value={formData.riskTolerance} 
            onValueChange={(value) => handleSelectChange('riskTolerance', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select risk tolerance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="investmentHorizon">
            Investment Horizon: {formData.investmentHorizon} years
          </Label>
          <Slider
            value={[formData.investmentHorizon]}
            min={1}
            max={40}
            step={1}
            onValueChange={(value) => handleSliderChange('investmentHorizon', value)}
            className="my-4"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" className="w-full">
          {isNewProfile ? 'Create Profile' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

// Main Financial Planning Page Component
const FinancialPlanning: React.FC = () => {
  const { 
    allProfiles,
    activeProfile: defaultActiveProfile,
    updateActiveProfile,
    createNewProfile,
    switchProfile,
    recommendations,
    opportunities,
    improvements,
    filterOpportunitiesByRisk,
    getRiskDescription,
    getProfileForCurrentUser
  } = useFinancialPlanning();
  
  const { user } = useAuth();
  const { speakText } = useAccessibility();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<string | undefined>(undefined);
  const [activeProfile, setActiveProfile] = useState(defaultActiveProfile);
  
  // Load the user's profile when the component mounts or user changes
  useEffect(() => {
    const userProfile = getProfileForCurrentUser(user);
    if (userProfile) {
      setActiveProfile(userProfile);
    }
  }, [user, getProfileForCurrentUser]);
  
  // Handle profile update
  const handleProfileUpdate = (updatedProfile: any) => {
    // Ensure we preserve the email from the original profile
    const profileWithEmail = {
      ...updatedProfile,
      email: activeProfile.email
    };
    updateActiveProfile(profileWithEmail);
    setProfileDialogOpen(false);
    setIsEditingProfile(false);
    speakText('Profile updated successfully');
  };
  
  // Handle creating new profile - disabled for now as we're showing only user's profile
  const handleCreateProfile = (newProfile: any) => {
    // Add user's email to the new profile
    const profileWithEmail = {
      ...newProfile,
      email: user?.email || ''
    };
    createNewProfile(profileWithEmail);
    setProfileDialogOpen(false);
    speakText('New profile created successfully');
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    speakText(`Switched to ${value} tab`);
  };
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">AI-Powered Financial Planning</h1>
            <p className="text-muted-foreground">
              Personalized investment strategies based on your financial profile
            </p>
          </div>
          <div className="flex space-x-2">
            {/* Remove the New Profile button - we only want one profile per user 
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Profile</DialogTitle>
                  <DialogDescription>
                    Enter your financial details to receive personalized investment recommendations.
                  </DialogDescription>
                </DialogHeader>
                <ProfileForm 
                  profile={null} 
                  onSubmit={handleCreateProfile}
                  isNewProfile
                />
              </DialogContent>
            </Dialog>
            */}
            
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* User Profile Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Your Financial Profile</CardTitle>
              <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Your Profile</DialogTitle>
                    <DialogDescription>
                      Update your financial details to receive updated recommendations.
                    </DialogDescription>
                  </DialogHeader>
                  <ProfileForm 
                    profile={activeProfile} 
                    onSubmit={handleProfileUpdate}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="text-primary h-5 w-5" />
                  <span className="font-medium">{activeProfile.name}</span>
                  <Badge variant="outline">{activeProfile.age} years old</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Annual Income</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(activeProfile.income)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Liquid Assets</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(activeProfile.liquidAssets)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Retirement Savings</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(activeProfile.retirement)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Risk Tolerance</div>
                    <div className="text-lg font-semibold capitalize">
                      {activeProfile.riskTolerance}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Investment Horizon</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{activeProfile.investmentHorizon} years</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Financial Goals
                </h4>
                <div className="space-y-4">
                  {activeProfile.goals.map((goal: any) => (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{goal.name}</span>
                        <Badge variant="outline" className="capitalize">{goal.priority} priority</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress: {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}</span>
                        <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                      </div>
                      <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Target date: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          {/* Remove the profile switcher - we only show the current user's profile
          {allProfiles.length > 1 && (
            <CardFooter className="pt-0 border-t flex flex-wrap gap-2">
              <div className="text-sm text-muted-foreground mr-2">Switch Profile:</div>
              {allProfiles.map(profile => (
                <Button
                  key={profile.id}
                  variant={profile.id === activeProfile.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => switchProfile(profile.id)}
                  className="text-xs h-7"
                >
                  {profile.name}
                </Button>
              ))}
            </CardFooter>
          )}
          */}
        </Card>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="recommendations" className="flex items-center justify-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Portfolio Strategies</span>
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Recommended Investments</span>
            </TabsTrigger>
            <TabsTrigger value="improvements" className="flex items-center justify-center gap-2">
              <LineChart className="h-4 w-4" />
              <span>Improvement Ideas</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recommendations.map(rec => (
                <Card key={rec.id}>
                  <CardHeader>
                    <CardTitle>{rec.name}</CardTitle>
                    <CardDescription>
                      {rec.timeHorizon}+ year investment horizon
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center mb-4">
                      <AssetAllocationChart allocation={rec.allocation} />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-1">Expected Annual Return</div>
                        <div className="text-2xl font-bold text-green-600">{rec.expectedReturn}%</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">Risk Level</div>
                        <RiskLevelIndicator level={rec.risk} />
                      </div>
                      
                      <div className="pt-3">
                        <div className="text-sm font-medium mb-1">Strategy Description</div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button className="w-full">View Detailed Analysis</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {recommendations.length === 0 && (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Matching Recommendations</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your current profile doesn't match any of our predefined strategies. Try adjusting your risk tolerance or investment horizon.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="pt-4">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant={selectedRisk === undefined ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedRisk(undefined);
                  filterOpportunitiesByRisk(undefined);
                }}
              >
                All
              </Button>
              <Button 
                variant={selectedRisk === 'low' ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedRisk('low');
                  filterOpportunitiesByRisk('low');
                }}
              >
                Low Risk
              </Button>
              <Button 
                variant={selectedRisk === 'moderate' ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedRisk('moderate');
                  filterOpportunitiesByRisk('moderate');
                }}
              >
                Moderate Risk
              </Button>
              <Button 
                variant={selectedRisk === 'high' ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedRisk('high');
                  filterOpportunitiesByRisk('high');
                }}
              >
                High Risk
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map(opp => (
                <InvestmentCard
                  key={opp.id}
                  type={opp.type}
                  name={opp.name}
                  ticker={opp.ticker}
                  price={opp.currentPrice}
                  recommendation={opp.recommendationType}
                  potentialReturn={opp.potentialReturn}
                  sector={opp.sector}
                  rationale={opp.rationale}
                />
              ))}
            </div>
            
            <div className="mt-6 text-sm text-muted-foreground text-center">
              <div className="flex items-center justify-center gap-1">
                <Info className="h-4 w-4" />
                <span>Investment recommendations are personalized based on your risk tolerance and financial goals.</span>
              </div>
            </div>
          </TabsContent>
          
          {/* Improvements Tab */}
          <TabsContent value="improvements" className="pt-4">
            <div className="space-y-6">
              {improvements.map((improvement, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {improvement.type === 'diversification' && <PieChart className="h-5 w-5 text-blue-500" />}
                      {improvement.type === 'risk-reduction' && <Sliders className="h-5 w-5 text-red-500" />}
                      {improvement.type === 'return-enhancement' && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {improvement.type === 'cost-reduction' && <DollarSign className="h-5 w-5 text-purple-500" />}
                      <CardTitle className="text-lg">{improvement.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm mt-1">
                      {improvement.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <LineChart className="h-4 w-4" />
                          Potential Impact
                        </h4>
                        <p className="text-sm text-muted-foreground">{improvement.potentialImpact}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Recommended Actions
                        </h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
                          {improvement.actionItems.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Risk Description */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Understanding Your Risk Tolerance: {activeProfile.riskTolerance}
          </h3>
          <p className="text-muted-foreground">
            {getRiskDescription(activeProfile.riskTolerance)}
          </p>
        </div>
        
        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            <strong>Important Disclaimer:</strong> The information provided here is for educational and illustrative purposes only and should not be construed as financial advice. Investment strategies and recommendations are generated by AI based on your profile inputs and historical market data. All investments involve risk, and past performance is not indicative of future results. Please consult with a qualified financial advisor before making any investment decisions.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinancialPlanning; 