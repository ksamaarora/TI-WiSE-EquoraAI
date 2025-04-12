import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

// Define types for financial planning data
export interface RiskTolerance {
  level: 'conservative' | 'moderate' | 'aggressive';
  description: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  income: number;
  liquidAssets: number;
  retirement: number;
  riskTolerance: RiskTolerance['level'];
  investmentHorizon: number; // in years
  goals: FinancialGoal[];
  email?: string; // Add email to associate with Firebase user
}

export interface AssetAllocation {
  stocks: number;
  bonds: number;
  cash: number;
  alternatives: number;
}

export interface InvestmentRecommendation {
  id: string;
  name: string;
  allocation: AssetAllocation;
  expectedReturn: number;
  risk: number;
  description: string;
  suitableFor: RiskTolerance['level'][];
  timeHorizon: number; // in years
}

export interface InvestmentOpportunity {
  id: string;
  type: 'stock' | 'etf' | 'bond' | 'mutual-fund' | 'reit';
  name: string;
  ticker: string;
  currentPrice: number;
  recommendationType: 'buy' | 'hold' | 'avoid';
  riskLevel: 'low' | 'moderate' | 'high';
  potentialReturn: number;
  sector: string;
  rationale: string;
}

export interface PortfolioImprovement {
  type: 'diversification' | 'risk-reduction' | 'return-enhancement' | 'cost-reduction';
  title: string;
  description: string;
  potentialImpact: string;
  actionItems: string[];
}

// Mock data for risk tolerance descriptions
const riskToleranceDescriptions: Record<RiskTolerance['level'], string> = {
  conservative: 'You prefer stability and are willing to accept lower returns to avoid market volatility.',
  moderate: 'You seek a balance between growth and stability, accepting some market fluctuations.',
  aggressive: 'You prioritize growth potential and can tolerate significant market volatility.'
};

// Mock data for user profiles
const mockUserProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Default Profile',
    age: 35,
    income: 85000,
    liquidAssets: 50000,
    retirement: 120000,
    riskTolerance: 'moderate',
    investmentHorizon: 20,
    email: 'user1@example.com',
    goals: [
      {
        id: 'g1',
        name: 'Retirement',
        targetAmount: 1500000,
        currentAmount: 120000,
        targetDate: '2050-01-01',
        priority: 'high'
      },
      {
        id: 'g2',
        name: 'Home Purchase',
        targetAmount: 100000,
        currentAmount: 30000,
        targetDate: '2025-01-01',
        priority: 'medium'
      }
    ]
  },
  {
    id: '2',
    name: 'Conservative Investor',
    age: 55,
    income: 120000,
    liquidAssets: 200000,
    retirement: 500000,
    riskTolerance: 'conservative',
    investmentHorizon: 10,
    email: 'user2@example.com',
    goals: [
      {
        id: 'g3',
        name: 'Retirement',
        targetAmount: 2000000,
        currentAmount: 500000,
        targetDate: '2030-01-01',
        priority: 'high'
      }
    ]
  }
];

// Mock investment recommendations
const mockRecommendations: InvestmentRecommendation[] = [
  {
    id: 'rec1',
    name: 'Conservative Portfolio',
    allocation: { stocks: 30, bonds: 50, cash: 15, alternatives: 5 },
    expectedReturn: 4.5,
    risk: 3,
    description: 'A conservative investment approach focusing on capital preservation with modest growth potential.',
    suitableFor: ['conservative'],
    timeHorizon: 5
  },
  {
    id: 'rec2',
    name: 'Balanced Growth',
    allocation: { stocks: 60, bonds: 30, cash: 5, alternatives: 5 },
    expectedReturn: 6.5,
    risk: 5,
    description: 'A balanced portfolio with moderate growth potential and reduced volatility through diversification.',
    suitableFor: ['moderate'],
    timeHorizon: 10
  },
  {
    id: 'rec3',
    name: 'Aggressive Growth',
    allocation: { stocks: 80, bonds: 10, cash: 0, alternatives: 10 },
    expectedReturn: 8.5,
    risk: 8,
    description: 'An aggressive growth strategy focusing on long-term capital appreciation with higher volatility.',
    suitableFor: ['aggressive'],
    timeHorizon: 15
  },
  {
    id: 'rec4',
    name: 'Income Generation',
    allocation: { stocks: 40, bonds: 55, cash: 5, alternatives: 0 },
    expectedReturn: 5.0,
    risk: 4,
    description: 'An income-focused portfolio with an emphasis on dividends and interest income.',
    suitableFor: ['conservative', 'moderate'],
    timeHorizon: 7
  },
  {
    id: 'rec5',
    name: 'Maximum Growth',
    allocation: { stocks: 90, bonds: 0, cash: 0, alternatives: 10 },
    expectedReturn: 10.0,
    risk: 9,
    description: 'A high-growth strategy with maximum equity exposure for long-term investors who can tolerate significant volatility.',
    suitableFor: ['aggressive'],
    timeHorizon: 20
  }
];

// Mock investment opportunities
const mockInvestmentOpportunities: InvestmentOpportunity[] = [
  {
    id: 'inv1',
    type: 'etf',
    name: 'Vanguard Total Stock Market ETF',
    ticker: 'VTI',
    currentPrice: 240.75,
    recommendationType: 'buy',
    riskLevel: 'moderate',
    potentialReturn: 7.5,
    sector: 'Broad Market',
    rationale: 'Broad market exposure with low expense ratio, suitable for core portfolio holdings.'
  },
  {
    id: 'inv2',
    type: 'etf',
    name: 'iShares Core U.S. Aggregate Bond ETF',
    ticker: 'AGG',
    currentPrice: 108.45,
    recommendationType: 'buy',
    riskLevel: 'low',
    potentialReturn: 3.2,
    sector: 'Fixed Income',
    rationale: 'Provides broad exposure to U.S. investment-grade bonds with stable income potential.'
  },
  {
    id: 'inv3',
    type: 'stock',
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    currentPrice: 340.20,
    recommendationType: 'buy',
    riskLevel: 'moderate',
    potentialReturn: 12.5,
    sector: 'Technology',
    rationale: 'Strong cloud growth, diversified revenue streams, and consistent dividend increases.'
  },
  {
    id: 'inv4',
    type: 'stock',
    name: 'Johnson & Johnson',
    ticker: 'JNJ',
    currentPrice: 162.38,
    recommendationType: 'hold',
    riskLevel: 'low',
    potentialReturn: 6.0,
    sector: 'Healthcare',
    rationale: 'Defensive stock with stable dividend, but facing some headwinds from litigation.'
  },
  {
    id: 'inv5',
    type: 'etf',
    name: 'Invesco QQQ Trust',
    ticker: 'QQQ',
    currentPrice: 398.65,
    recommendationType: 'buy',
    riskLevel: 'high',
    potentialReturn: 14.0,
    sector: 'Technology',
    rationale: 'Concentrated exposure to innovative tech companies with strong growth potential.'
  },
  {
    id: 'inv6',
    type: 'bond',
    name: 'U.S. Treasury 10-Year',
    ticker: 'USTY',
    currentPrice: 96.75,
    recommendationType: 'hold',
    riskLevel: 'low',
    potentialReturn: 4.2,
    sector: 'Government',
    rationale: 'Safe-haven asset providing steady income with minimal default risk.'
  },
  {
    id: 'inv7',
    type: 'mutual-fund',
    name: 'Fidelity Contrafund',
    ticker: 'FCNTX',
    currentPrice: 15.42,
    recommendationType: 'buy',
    riskLevel: 'moderate',
    potentialReturn: 9.0,
    sector: 'Large Growth',
    rationale: 'Strong track record of outperforming the S&P 500 with focus on quality growth companies.'
  },
  {
    id: 'inv8',
    type: 'reit',
    name: 'Prologis, Inc.',
    ticker: 'PLD',
    currentPrice: 125.60,
    recommendationType: 'buy',
    riskLevel: 'moderate',
    potentialReturn: 8.5,
    sector: 'Real Estate',
    rationale: 'Leading logistics REIT benefiting from e-commerce growth with reliable dividend.'
  }
];

// Mock portfolio improvement suggestions
const mockPortfolioImprovements: PortfolioImprovement[] = [
  {
    type: 'diversification',
    title: 'Increase International Exposure',
    description: 'Your portfolio is heavily concentrated in domestic assets. Adding international exposure can improve diversification.',
    potentialImpact: 'Potentially lower overall portfolio volatility while maintaining similar returns.',
    actionItems: [
      'Consider adding 15-20% allocation to international developed markets',
      'Add 5-10% exposure to emerging markets for long-term growth',
      'Look into Vanguard FTSE Developed Markets ETF (VEA) or iShares Core MSCI EAFE ETF (IEFA)'
    ]
  },
  {
    type: 'risk-reduction',
    title: 'Reduce Sector Concentration',
    description: 'Your portfolio has significant exposure to technology sector, creating concentration risk.',
    potentialImpact: 'More balanced sector exposure can reduce volatility during sector-specific downturns.',
    actionItems: [
      'Consider reducing technology allocation by 10-15%',
      'Increase exposure to defensive sectors like healthcare and consumer staples',
      'Explore sector-rotation ETFs that adjust allocations based on economic cycles'
    ]
  },
  {
    type: 'return-enhancement',
    title: 'Optimize Tax Efficiency',
    description: 'Your investment account structure may not be maximizing tax advantages.',
    potentialImpact: 'Improved after-tax returns without increasing portfolio risk.',
    actionItems: [
      'Consider placing high-yield investments in tax-advantaged accounts',
      'Hold tax-efficient ETFs in taxable accounts',
      'Implement tax-loss harvesting when opportunities arise'
    ]
  },
  {
    type: 'cost-reduction',
    title: 'Reduce Investment Expenses',
    description: 'Some of your current holdings have above-average expense ratios.',
    potentialImpact: 'Lower fees directly improve your net returns without increasing risk.',
    actionItems: [
      'Replace high-cost mutual funds with comparable lower-cost ETFs',
      'Consider index funds for core portfolio positions',
      'Review account maintenance fees and consider consolidating accounts'
    ]
  }
];

// Financial Planning Service
class FinancialPlanningService {
  private profiles: UserProfile[] = [...mockUserProfiles];
  private recommendations: InvestmentRecommendation[] = [...mockRecommendations];
  private investmentOpportunities: InvestmentOpportunity[] = [...mockInvestmentOpportunities];
  private portfolioImprovements: PortfolioImprovement[] = [...mockPortfolioImprovements];
  private activeProfile: string = '1'; // Default profile ID
  
  // Get active user profile
  getActiveProfile(): UserProfile {
    return this.profiles.find(p => p.id === this.activeProfile) || this.profiles[0];
  }
  
  // Get all profiles
  getAllProfiles(): UserProfile[] {
    return [...this.profiles];
  }
  
  // Create new profile
  createProfile(profile: Omit<UserProfile, 'id'>): UserProfile {
    const newProfile = {
      ...profile,
      id: `profile_${Date.now()}`
    };
    this.profiles.push(newProfile);
    return newProfile;
  }
  
  // Update profile
  updateProfile(profile: UserProfile): UserProfile {
    const index = this.profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      this.profiles[index] = profile;
      return profile;
    }
    throw new Error('Profile not found');
  }
  
  // Set active profile
  setActiveProfile(profileId: string): void {
    if (this.profiles.some(p => p.id === profileId)) {
      this.activeProfile = profileId;
    } else {
      throw new Error('Profile not found');
    }
  }
  
  // Get investment recommendations for profile
  getRecommendationsForProfile(profileId?: string): InvestmentRecommendation[] {
    const profile = profileId 
      ? this.profiles.find(p => p.id === profileId)
      : this.getActiveProfile();
      
    if (!profile) return [];
    
    return this.recommendations.filter(rec => 
      rec.suitableFor.includes(profile.riskTolerance) && 
      rec.timeHorizon <= profile.investmentHorizon
    );
  }
  
  // Get investment opportunities for risk level
  getInvestmentOpportunities(riskLevel?: 'low' | 'moderate' | 'high'): InvestmentOpportunity[] {
    if (!riskLevel) {
      return [...this.investmentOpportunities];
    }
    return this.investmentOpportunities.filter(opp => opp.riskLevel === riskLevel);
  }
  
  // Get portfolio improvement suggestions
  getPortfolioImprovements(): PortfolioImprovement[] {
    return [...this.portfolioImprovements];
  }
  
  // Get risk tolerance description
  getRiskToleranceDescription(level: RiskTolerance['level']): string {
    return riskToleranceDescriptions[level];
  }
  
  // Get profile for a specific Firebase user
  getProfileForUser(user: User | null): UserProfile | null {
    if (!user || !user.email) return null;
    
    // Try to find a profile with matching email
    const userProfile = this.profiles.find(profile => profile.email === user.email);
    
    // If profile exists, return it
    if (userProfile) {
      this.activeProfile = userProfile.id;
      return userProfile;
    }
    
    // If no profile exists, create a default one for this user
    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      name: user.displayName || 'New User',
      age: 35,
      income: 85000,
      liquidAssets: 50000,
      retirement: 120000,
      riskTolerance: 'moderate',
      investmentHorizon: 20,
      email: user.email,
      goals: [
        {
          id: `goal_${Date.now()}`,
          name: 'Retirement',
          targetAmount: 1500000,
          currentAmount: 120000,
          targetDate: '2050-01-01',
          priority: 'high'
        }
      ]
    };
    
    this.profiles.push(newProfile);
    this.activeProfile = newProfile.id;
    return newProfile;
  }
}

// Create singleton instance
export const financialPlanningService = new FinancialPlanningService();

// React hook for using financial planning
export function useFinancialPlanning() {
  const [activeProfile, setActiveProfile] = useState<UserProfile>(
    financialPlanningService.getActiveProfile()
  );
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>(
    financialPlanningService.getRecommendationsForProfile()
  );
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>(
    financialPlanningService.getInvestmentOpportunities()
  );
  const [improvements, setImprovements] = useState<PortfolioImprovement[]>(
    financialPlanningService.getPortfolioImprovements()
  );
  
  // Update active profile
  const updateActiveProfile = (profile: UserProfile) => {
    const updated = financialPlanningService.updateProfile(profile);
    setActiveProfile(updated);
    
    // Refresh recommendations based on updated profile
    setRecommendations(financialPlanningService.getRecommendationsForProfile(updated.id));
  };
  
  // Create new profile
  const createNewProfile = (profile: Omit<UserProfile, 'id'>) => {
    const newProfile = financialPlanningService.createProfile(profile);
    financialPlanningService.setActiveProfile(newProfile.id);
    setActiveProfile(newProfile);
    setRecommendations(financialPlanningService.getRecommendationsForProfile(newProfile.id));
    return newProfile;
  };
  
  // Switch active profile
  const switchProfile = (profileId: string) => {
    financialPlanningService.setActiveProfile(profileId);
    const profile = financialPlanningService.getActiveProfile();
    setActiveProfile(profile);
    setRecommendations(financialPlanningService.getRecommendationsForProfile(profile.id));
  };
  
  // Filter investment opportunities by risk
  const filterOpportunitiesByRisk = (risk?: 'low' | 'moderate' | 'high') => {
    setOpportunities(financialPlanningService.getInvestmentOpportunities(risk));
  };
  
  // Get risk tolerance description
  const getRiskDescription = (level: RiskTolerance['level']): string => {
    return financialPlanningService.getRiskToleranceDescription(level);
  };
  
  // Get profile for current Firebase user
  const getProfileForCurrentUser = (user: User | null) => {
    return financialPlanningService.getProfileForUser(user);
  };
  
  return {
    activeProfile,
    recommendations,
    opportunities,
    improvements,
    allProfiles: financialPlanningService.getAllProfiles(),
    updateActiveProfile,
    createNewProfile,
    switchProfile,
    filterOpportunitiesByRisk,
    getRiskDescription,
    getProfileForCurrentUser
  };
} 