import { useState, useEffect } from 'react';

// Define types for regulatory data
export interface RegulatoryAlert {
  id: string;
  title: string;
  description: string;
  authority: 'SEC' | 'SEBI' | 'IRS' | 'FINRA' | 'RBI' | 'Other';
  category: 'Regulation' | 'Compliance' | 'Tax' | 'Enforcement' | 'Guidance';
  impactLevel: 'High' | 'Medium' | 'Low';
  affectedSectors: string[];
  publishDate: Date;
  effectiveDate: Date | null;
  link: string;
  status: 'New' | 'Updated' | 'Upcoming' | 'Enforced' | 'Archived';
  relevanceScore: number; // 0-100 based on user profile and portfolio
  isRead: boolean;
}

// Mock data for regulatory alerts
const mockRegulatoryAlerts: RegulatoryAlert[] = [
  {
    id: 'reg-001',
    title: 'New SEC Regulations on Cryptocurrency Reporting',
    description: 'The SEC has approved new rules requiring public companies to disclose their cryptocurrency holdings and risk exposure in quarterly and annual reports.',
    authority: 'SEC',
    category: 'Regulation',
    impactLevel: 'High',
    affectedSectors: ['Cryptocurrency', 'Banking', 'Financial Services'],
    publishDate: new Date(2023, 10, 15),
    effectiveDate: new Date(2024, 0, 1),
    link: 'https://www.sec.gov/rules/cryptocurrency-reporting',
    status: 'Upcoming',
    relevanceScore: 95,
    isRead: false
  },
  {
    id: 'reg-002',
    title: 'SEBI Guidelines on ESG Disclosures for Listed Entities',
    description: 'SEBI has introduced new guidelines requiring listed companies to make comprehensive disclosures on Environmental, Social, and Governance (ESG) factors in their annual reports.',
    authority: 'SEBI',
    category: 'Compliance',
    impactLevel: 'Medium',
    affectedSectors: ['All Sectors', 'Energy', 'Manufacturing'],
    publishDate: new Date(2023, 9, 5),
    effectiveDate: new Date(2024, 3, 1),
    link: 'https://www.sebi.gov.in/guidelines/esg-disclosures',
    status: 'Upcoming',
    relevanceScore: 80,
    isRead: false
  },
  {
    id: 'reg-003',
    title: 'IRS Updates on Crypto Taxation for FY 2023-24',
    description: 'The IRS has released updated guidance on cryptocurrency taxation, including new reporting requirements for digital asset transactions exceeding $10,000.',
    authority: 'IRS',
    category: 'Tax',
    impactLevel: 'High',
    affectedSectors: ['Cryptocurrency', 'Financial Services', 'Technology'],
    publishDate: new Date(2023, 8, 20),
    effectiveDate: new Date(2023, 11, 31),
    link: 'https://www.irs.gov/publications/crypto-tax-guidance-2023',
    status: 'Enforced',
    relevanceScore: 90,
    isRead: true
  },
  {
    id: 'reg-004',
    title: 'FINRA Rule Amendment on Best Execution Practices',
    description: 'FINRA has approved amendments to Rule 5310 that enhance best execution requirements for broker-dealers when handling customer orders.',
    authority: 'FINRA',
    category: 'Regulation',
    impactLevel: 'Medium',
    affectedSectors: ['Brokerage', 'Financial Services'],
    publishDate: new Date(2023, 7, 10),
    effectiveDate: new Date(2024, 1, 15),
    link: 'https://www.finra.org/rules-guidance/rule-5310-amendments',
    status: 'Upcoming',
    relevanceScore: 75,
    isRead: false
  },
  {
    id: 'reg-005',
    title: 'SEC Enforcement Actions Against Market Manipulation',
    description: 'The SEC has announced a series of enforcement actions against firms involved in market manipulation practices, resulting in penalties totaling over $1.2 billion.',
    authority: 'SEC',
    category: 'Enforcement',
    impactLevel: 'Medium',
    affectedSectors: ['Brokerage', 'Trading Platforms', 'Financial Services'],
    publishDate: new Date(2023, 6, 25),
    effectiveDate: null,
    link: 'https://www.sec.gov/enforcement/market-manipulation-2023',
    status: 'Enforced',
    relevanceScore: 65,
    isRead: true
  },
  {
    id: 'reg-006',
    title: 'RBI Guidelines on Digital Lending',
    description: 'The Reserve Bank of India has issued comprehensive guidelines on digital lending, focusing on enhanced disclosure norms, data privacy, and ethical recovery practices.',
    authority: 'RBI',
    category: 'Guidance',
    impactLevel: 'High',
    affectedSectors: ['Banking', 'Fintech', 'NBFCs'],
    publishDate: new Date(2023, 5, 12),
    effectiveDate: new Date(2023, 8, 1),
    link: 'https://www.rbi.org.in/guidelines/digital-lending',
    status: 'Enforced',
    relevanceScore: 85,
    isRead: false
  },
  {
    id: 'reg-007',
    title: 'SEBI Tightens Disclosure Norms for Listed Companies',
    description: 'SEBI has strengthened disclosure requirements for listed entities regarding related party transactions, board changes, and material events.',
    authority: 'SEBI',
    category: 'Compliance',
    impactLevel: 'Medium',
    affectedSectors: ['All Sectors'],
    publishDate: new Date(2023, 4, 18),
    effectiveDate: new Date(2023, 9, 1),
    link: 'https://www.sebi.gov.in/circulars/disclosure-norms-2023',
    status: 'Enforced',
    relevanceScore: 70,
    isRead: true
  },
  {
    id: 'reg-008',
    title: 'New Tax Implications for Foreign Portfolio Investors',
    description: 'Recent amendments to tax regulations affecting Foreign Portfolio Investors (FPIs) in India, including changes to capital gains taxation and TDS requirements.',
    authority: 'SEBI',
    category: 'Tax',
    impactLevel: 'High',
    affectedSectors: ['Foreign Investments', 'Financial Services'],
    publishDate: new Date(2023, 3, 5),
    effectiveDate: new Date(2023, 6, 1),
    link: 'https://www.sebi.gov.in/tax/fpi-regulations',
    status: 'Enforced',
    relevanceScore: 80,
    isRead: false
  },
  {
    id: 'reg-009',
    title: 'SEC Proposes Rules on Climate-Related Disclosures',
    description: 'The SEC has proposed rules that would require public companies to include climate-related disclosures in their registration statements and periodic reports.',
    authority: 'SEC',
    category: 'Regulation',
    impactLevel: 'High',
    affectedSectors: ['All Sectors', 'Energy', 'Manufacturing', 'Utilities'],
    publishDate: new Date(2023, 2, 22),
    effectiveDate: new Date(2024, 5, 15),
    link: 'https://www.sec.gov/rules/proposed/climate-disclosure',
    status: 'Upcoming',
    relevanceScore: 90,
    isRead: false
  },
  {
    id: 'reg-010',
    title: 'FINRA Guidance on Cybersecurity Practices',
    description: 'FINRA has issued updated guidance on cybersecurity practices for broker-dealers, focusing on data protection, incident response, and vendor management.',
    authority: 'FINRA',
    category: 'Guidance',
    impactLevel: 'Medium',
    affectedSectors: ['Brokerage', 'Financial Services', 'Technology'],
    publishDate: new Date(2023, 1, 10),
    effectiveDate: null,
    link: 'https://www.finra.org/cybersecurity-guidance-2023',
    status: 'Enforced',
    relevanceScore: 75,
    isRead: true
  }
];

// Define filters for regulatory alerts
export interface RegulatoryFilters {
  authority?: string[];
  category?: string[];
  impactLevel?: string[];
  status?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  searchTerm?: string;
  showReadOnly?: boolean;
  showUnreadOnly?: boolean;
}

// Create regulatory service
class RegulatoryService {
  private alerts: RegulatoryAlert[] = [...mockRegulatoryAlerts];
  private subscribers: ((data: RegulatoryAlert[]) => void)[] = [];

  // Get all alerts
  getAlerts(): RegulatoryAlert[] {
    return [...this.alerts];
  }

  // Get filtered alerts
  getFilteredAlerts(filters: RegulatoryFilters): RegulatoryAlert[] {
    let filteredAlerts = [...this.alerts];

    // Apply authority filter
    if (filters.authority && filters.authority.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.authority!.includes(alert.authority));
    }

    // Apply category filter
    if (filters.category && filters.category.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.category!.includes(alert.category));
    }

    // Apply impact level filter
    if (filters.impactLevel && filters.impactLevel.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.impactLevel!.includes(alert.impactLevel));
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.status!.includes(alert.status));
    }

    // Apply date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.publishDate >= filters.dateRange!.start!);
      }
      if (filters.dateRange.end) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.publishDate <= filters.dateRange!.end!);
      }
    }

    // Apply search term filter
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const term = filters.searchTerm.toLowerCase().trim();
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.title.toLowerCase().includes(term) || 
        alert.description.toLowerCase().includes(term) ||
        alert.authority.toLowerCase().includes(term) ||
        alert.category.toLowerCase().includes(term) ||
        alert.affectedSectors.some(sector => sector.toLowerCase().includes(term))
      );
    }

    // Apply read/unread filters
    if (filters.showReadOnly) {
      filteredAlerts = filteredAlerts.filter(alert => alert.isRead);
    } else if (filters.showUnreadOnly) {
      filteredAlerts = filteredAlerts.filter(alert => !alert.isRead);
    }

    return filteredAlerts;
  }

  // Mark alert as read
  markAsRead(alertId: string): void {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      this.alerts[alertIndex] = {
        ...this.alerts[alertIndex],
        isRead: true
      };
      this.notifySubscribers();
    }
  }

  // Mark alert as unread
  markAsUnread(alertId: string): void {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      this.alerts[alertIndex] = {
        ...this.alerts[alertIndex],
        isRead: false
      };
      this.notifySubscribers();
    }
  }

  // Mark all alerts as read
  markAllAsRead(): void {
    this.alerts = this.alerts.map(alert => ({
      ...alert,
      isRead: true
    }));
    this.notifySubscribers();
  }

  // Get unread alerts count
  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.isRead).length;
  }

  // Get high impact alerts
  getHighImpactAlerts(): RegulatoryAlert[] {
    return this.alerts.filter(alert => 
      alert.impactLevel === 'High' && !alert.isRead
    );
  }

  // Subscribe to alerts updates
  subscribe(callback: (data: RegulatoryAlert[]) => void): () => void {
    this.subscribers.push(callback);
    // Immediately invoke callback with current data
    callback(this.getAlerts());
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers of data changes
  private notifySubscribers(): void {
    const data = this.getAlerts();
    this.subscribers.forEach(callback => callback(data));
  }
}

// Create singleton instance
export const regulatoryService = new RegulatoryService();

// React hook for using regulatory alerts
export function useRegulatoryAlerts(filters: RegulatoryFilters = {}) {
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    // Subscribe to regulatory alerts
    const unsubscribe = regulatoryService.subscribe((data) => {
      const filteredData = regulatoryService.getFilteredAlerts(filters);
      setAlerts(filteredData);
      setUnreadCount(regulatoryService.getUnreadCount());
      setLoading(false);
    });
    
    // Clean up subscription
    return unsubscribe;
  }, [
    filters.authority,
    filters.category,
    filters.impactLevel,
    filters.status,
    filters.dateRange?.start,
    filters.dateRange?.end,
    filters.searchTerm,
    filters.showReadOnly,
    filters.showUnreadOnly
  ]);

  // Actions
  const markAsRead = (alertId: string) => regulatoryService.markAsRead(alertId);
  const markAsUnread = (alertId: string) => regulatoryService.markAsUnread(alertId);
  const markAllAsRead = () => regulatoryService.markAllAsRead();

  return {
    alerts,
    loading,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    getHighImpactAlerts: () => regulatoryService.getHighImpactAlerts()
  };
} 