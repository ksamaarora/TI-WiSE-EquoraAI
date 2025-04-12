import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  RegulatoryAlert, 
  RegulatoryFilters, 
  useRegulatoryAlerts 
} from '@/services/regulatoryService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/lib/accessibility';

// Icons
import { 
  Bell, 
  AlertTriangle, 
  FileText, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Bookmark,
  Info,
  Clock,
  ExternalLink,
  Tag,
  Check,
  BarChart,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Define the authority colors and icons
const AUTHORITY_CONFIG: Record<string, { color: string, icon: React.ReactNode }> = {
  'SEC': { 
    color: 'bg-blue-500', 
    icon: <FileText size={14} /> 
  },
  'SEBI': { 
    color: 'bg-purple-500', 
    icon: <Building2 size={14} /> 
  },
  'IRS': { 
    color: 'bg-green-500', 
    icon: <BarChart size={14} /> 
  },
  'FINRA': { 
    color: 'bg-orange-500', 
    icon: <BookOpen size={14} /> 
  },
  'RBI': { 
    color: 'bg-red-500', 
    icon: <Building2 size={14} /> 
  },
  'Other': { 
    color: 'bg-gray-500', 
    icon: <Info size={14} /> 
  }
};

// Define the category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Regulation': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
  'Compliance': 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
  'Tax': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
  'Enforcement': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
  'Guidance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
};

// Define impact level styling
const IMPACT_LEVEL_COLORS: Record<string, string> = {
  'High': 'text-red-600 dark:text-red-400',
  'Medium': 'text-orange-600 dark:text-orange-400',
  'Low': 'text-blue-600 dark:text-blue-400'
};

// Define status styling
const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-green-500 text-white',
  'Updated': 'bg-blue-500 text-white',
  'Upcoming': 'bg-yellow-500 text-white',
  'Enforced': 'bg-purple-500 text-white',
  'Archived': 'bg-gray-500 text-white'
};

const Regulatory: React.FC = () => {
  // Initialize filters
  const [filters, setFilters] = useState<RegulatoryFilters>({
    authority: [],
    category: [],
    impactLevel: [],
    status: [],
    dateRange: {
      start: null,
      end: null
    },
    searchTerm: '',
    showReadOnly: false,
    showUnreadOnly: false
  });

  // Get regulatory alerts data
  const { 
    alerts, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAsUnread, 
    markAllAsRead,
    getHighImpactAlerts
  } = useRegulatoryAlerts(filters);

  const { speakText } = useAccessibility();
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get high impact alerts
  const highImpactAlerts = getHighImpactAlerts();

  // Handle filter changes
  const handleAuthorityFilterChange = (authority: string) => {
    setFilters(prev => {
      const currentAuthorities = prev.authority || [];
      const newAuthorities = currentAuthorities.includes(authority)
        ? currentAuthorities.filter(a => a !== authority)
        : [...currentAuthorities, authority];
      
      return {
        ...prev,
        authority: newAuthorities.length ? newAuthorities : undefined
      };
    });
  };

  const handleCategoryFilterChange = (category: string) => {
    setFilters(prev => {
      const currentCategories = prev.category || [];
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category];
      
      return {
        ...prev,
        category: newCategories.length ? newCategories : undefined
      };
    });
  };

  const handleImpactLevelFilterChange = (impactLevel: string) => {
    setFilters(prev => {
      const currentLevels = prev.impactLevel || [];
      const newLevels = currentLevels.includes(impactLevel)
        ? currentLevels.filter(l => l !== impactLevel)
        : [...currentLevels, impactLevel];
      
      return {
        ...prev,
        impactLevel: newLevels.length ? newLevels : undefined
      };
    });
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters(prev => {
      const currentStatuses = prev.status || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status];
      
      return {
        ...prev,
        status: newStatuses.length ? newStatuses : undefined
      };
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };

  const handleDateRangeChange = (date: Date | undefined, type: 'start' | 'end') => {
    if (!date) return;
    
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange!,
        [type]: date
      }
    }));
  };

  const handleReadFilterChange = (type: 'read' | 'unread') => {
    setFilters(prev => ({
      ...prev,
      showReadOnly: type === 'read' ? !prev.showReadOnly : false,
      showUnreadOnly: type === 'unread' ? !prev.showUnreadOnly : false
    }));
  };

  const clearFilters = () => {
    setFilters({
      authority: [],
      category: [],
      impactLevel: [],
      status: [],
      dateRange: {
        start: null,
        end: null
      },
      searchTerm: '',
      showReadOnly: false,
      showUnreadOnly: false
    });
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters(prev => {
      // Reset filters first
      const newFilters: RegulatoryFilters = {
        ...prev,
        authority: [],
        category: [],
        impactLevel: [],
        status: [],
        showReadOnly: false,
        showUnreadOnly: false
      };
      
      // Apply specific filters based on tab
      if (value === 'high-impact') {
        newFilters.impactLevel = ['High'];
      } else if (value === 'unread') {
        newFilters.showUnreadOnly = true;
      } else if (value === 'upcoming') {
        newFilters.status = ['Upcoming'];
      }
      
      return newFilters;
    });
  };

  // Handle alert expansion
  const toggleAlertExpansion = (alertId: string) => {
    if (expandedAlertId === alertId) {
      setExpandedAlertId(null);
    } else {
      setExpandedAlertId(alertId);
      // Mark as read when expanded
      markAsRead(alertId);
    }
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return format(date, 'MMM dd, yyyy');
  };

  // Handle read/mark unread
  const toggleReadStatus = (e: React.MouseEvent, alert: RegulatoryAlert) => {
    e.stopPropagation();
    if (alert.isRead) {
      markAsUnread(alert.id);
      speakText(`Marked ${alert.title} as unread`);
    } else {
      markAsRead(alert.id);
      speakText(`Marked ${alert.title} as read`);
    }
  };

  // Handle "mark all as read"
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    speakText('Marked all alerts as read');
  };

  // Handle notification click
  const speakAlert = (alert: RegulatoryAlert) => {
    speakText(`${alert.title} by ${alert.authority}. Impact level: ${alert.impactLevel}. Status: ${alert.status}`);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      (filters.authority && filters.authority.length) ||
      (filters.category && filters.category.length) ||
      (filters.impactLevel && filters.impactLevel.length) ||
      (filters.status && filters.status.length) ||
      (filters.dateRange?.start || filters.dateRange?.end) ||
      filters.searchTerm ||
      filters.showReadOnly ||
      filters.showUnreadOnly
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Regulatory & Compliance Alerts</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest regulations from SEC, SEBI, and more
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter size={16} className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center"
              >
                <CheckCircle2 size={16} className="mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* High Impact Alerts Banner (if any exist) */}
        {highImpactAlerts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  {highImpactAlerts.length} High Impact {highImpactAlerts.length === 1 ? 'Alert' : 'Alerts'} Requiring Attention
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul className="list-disc pl-5 space-y-1">
                    {highImpactAlerts.slice(0, 2).map(alert => (
                      <li key={alert.id}>
                        <button 
                          className="underline hover:text-red-800 dark:hover:text-red-200"
                          onClick={() => {
                            setExpandedAlertId(alert.id);
                            setActiveTab('high-impact');
                          }}
                        >
                          {alert.title} - {alert.authority}
                        </button>
                      </li>
                    ))}
                    {highImpactAlerts.length > 2 && (
                      <li>
                        <button 
                          className="underline hover:text-red-800 dark:hover:text-red-200"
                          onClick={() => setActiveTab('high-impact')}
                        >
                          View {highImpactAlerts.length - 2} more high impact {highImpactAlerts.length - 2 === 1 ? 'alert' : 'alerts'}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        {showFilters && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filter Alerts</CardTitle>
                {hasActiveFilters() && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <CardDescription>Narrow down alerts based on specific criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="col-span-1 lg:col-span-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts by keyword..."
                      className="pl-8"
                      value={filters.searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>

                {/* Authority Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Authority</h3>
                  <div className="space-y-2">
                    {['SEC', 'SEBI', 'IRS', 'FINRA', 'RBI', 'Other'].map(authority => (
                      <div key={authority} className="flex items-center">
                        <Checkbox 
                          id={`authority-${authority}`} 
                          checked={(filters.authority || []).includes(authority)}
                          onCheckedChange={() => handleAuthorityFilterChange(authority)}
                        />
                        <label 
                          htmlFor={`authority-${authority}`}
                          className="ml-2 text-sm flex items-center"
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full mr-1.5",
                            AUTHORITY_CONFIG[authority].color
                          )} />
                          {authority}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Category</h3>
                  <div className="space-y-2">
                    {['Regulation', 'Compliance', 'Tax', 'Enforcement', 'Guidance'].map(category => (
                      <div key={category} className="flex items-center">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={(filters.category || []).includes(category)}
                          onCheckedChange={() => handleCategoryFilterChange(category)}
                        />
                        <label 
                          htmlFor={`category-${category}`}
                          className="ml-2 text-sm"
                        >
                          <Badge variant="outline" className={cn(
                            "font-normal py-0 h-5",
                            CATEGORY_COLORS[category]
                          )}>
                            {category}
                          </Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impact Level Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Impact Level</h3>
                  <div className="space-y-2">
                    {['High', 'Medium', 'Low'].map(level => (
                      <div key={level} className="flex items-center">
                        <Checkbox 
                          id={`impact-${level}`} 
                          checked={(filters.impactLevel || []).includes(level)}
                          onCheckedChange={() => handleImpactLevelFilterChange(level)}
                        />
                        <label 
                          htmlFor={`impact-${level}`}
                          className={cn(
                            "ml-2 text-sm font-medium",
                            IMPACT_LEVEL_COLORS[level]
                          )}
                        >
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="space-y-2">
                    {['New', 'Updated', 'Upcoming', 'Enforced', 'Archived'].map(status => (
                      <div key={status} className="flex items-center">
                        <Checkbox 
                          id={`status-${status}`} 
                          checked={(filters.status || []).includes(status)}
                          onCheckedChange={() => handleStatusFilterChange(status)}
                        />
                        <label 
                          htmlFor={`status-${status}`}
                          className="ml-2 text-sm"
                        >
                          <Badge className={cn(
                            "font-normal",
                            STATUS_COLORS[status]
                          )}>
                            {status}
                          </Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Date Range Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Date Range</h3>
                  <div className="flex flex-col space-y-2">
                    <div>
                      <Label className="text-xs">Start Date</Label>
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateRange?.start && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {filters.dateRange?.start ? (
                              formatDate(filters.dateRange.start)
                            ) : (
                              "Select start date"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={filters.dateRange?.start || undefined}
                            onSelect={(date) => handleDateRangeChange(date, 'start')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-xs">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateRange?.end && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {filters.dateRange?.end ? (
                              formatDate(filters.dateRange.end)
                            ) : (
                              "Select end date"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={filters.dateRange?.end || undefined}
                            onSelect={(date) => handleDateRangeChange(date, 'end')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Read/Unread Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Read Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox 
                        id="read-only" 
                        checked={filters.showReadOnly}
                        onCheckedChange={() => handleReadFilterChange('read')}
                      />
                      <label htmlFor="read-only" className="ml-2 text-sm flex items-center">
                        <Eye size={14} className="mr-1.5" />
                        Read
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="unread-only" 
                        checked={filters.showUnreadOnly}
                        onCheckedChange={() => handleReadFilterChange('unread')}
                      />
                      <label htmlFor="unread-only" className="ml-2 text-sm flex items-center">
                        <EyeOff size={14} className="mr-1.5" />
                        Unread
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab navigation */}
        <div>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center justify-center">
                <FileText size={16} className="mr-2" />
                All Alerts
              </TabsTrigger>
              <TabsTrigger value="high-impact" className="flex items-center justify-center">
                <AlertTriangle size={16} className="mr-2" />
                High Impact
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center justify-center">
                <Bell size={16} className="mr-2" />
                Unread <Badge className="ml-1 bg-primary">{unreadCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center justify-center">
                <Clock size={16} className="mr-2" />
                Upcoming
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'all' && 'All Regulatory Alerts'}
              {activeTab === 'high-impact' && 'High Impact Alerts'}
              {activeTab === 'unread' && 'Unread Alerts'}
              {activeTab === 'upcoming' && 'Upcoming Regulations'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'all' && 'Comprehensive list of all regulatory and compliance alerts'}
              {activeTab === 'high-impact' && 'Critical regulatory changes that may significantly impact your business'}
              {activeTab === 'unread' && 'Alerts you have not yet reviewed'}
              {activeTab === 'upcoming' && 'Regulations that will be enforced in the near future'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading alerts...
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 mx-auto text-muted-foreground/50" />
                <p className="mb-2">No alerts found</p>
                <p className="text-sm">Try adjusting your filters or check back later for updates</p>
              </div>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={cn(
                        "border rounded-md overflow-hidden transition-colors",
                        !alert.isRead && "bg-blue-50 dark:bg-blue-900/10",
                        expandedAlertId === alert.id && "border-primary"
                      )}
                      aria-expanded={expandedAlertId === alert.id}
                    >
                      {/* Alert Header */}
                      <div 
                        className="p-4 cursor-pointer flex items-start justify-between gap-2"
                        onClick={() => toggleAlertExpansion(alert.id)}
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-1.5">
                            {/* Authority Badge */}
                            <div className="flex items-center gap-1">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                AUTHORITY_CONFIG[alert.authority].color
                              )} />
                              <span className="text-xs font-medium">{alert.authority}</span>
                            </div>

                            {/* Category Badge */}
                            <Badge variant="outline" className={cn(
                              "font-normal py-0 h-5",
                              CATEGORY_COLORS[alert.category]
                            )}>
                              {alert.category}
                            </Badge>

                            {/* Status Badge */}
                            <Badge className={cn(
                              "ml-auto font-normal",
                              STATUS_COLORS[alert.status]
                            )}>
                              {alert.status}
                            </Badge>

                            {!alert.isRead && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 font-normal">
                                New
                              </Badge>
                            )}
                          </div>

                          <h3 className={cn(
                            "text-base font-medium",
                            !alert.isRead && "font-semibold"
                          )}>
                            {alert.title}
                          </h3>

                          <div className="flex flex-wrap items-center text-xs text-muted-foreground mt-1.5 gap-x-4 gap-y-1">
                            <div className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              Published: {formatDate(alert.publishDate)}
                            </div>
                            
                            {alert.effectiveDate && (
                              <div className="flex items-center">
                                <Clock size={12} className="mr-1" />
                                Effective: {formatDate(alert.effectiveDate)}
                              </div>
                            )}
                            
                            <div className={cn(
                              "flex items-center font-medium",
                              IMPACT_LEVEL_COLORS[alert.impactLevel]
                            )}>
                              <AlertTriangle size={12} className="mr-1" />
                              {alert.impactLevel} Impact
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => toggleReadStatus(e, alert)}
                            aria-label={alert.isRead ? "Mark as unread" : "Mark as read"}
                          >
                            {alert.isRead ? (
                              <EyeOff size={16} className="text-muted-foreground" />
                            ) : (
                              <Eye size={16} className="text-blue-600" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakAlert(alert);
                            }}
                            aria-label="Speak alert details"
                          >
                            <Info size={16} className="text-muted-foreground" />
                          </Button>
                        </div>
                      </div>

                      {/* Alert Content (Expanded) */}
                      {expandedAlertId === alert.id && (
                        <div className="p-4 pt-0">
                          <Separator className="mb-4" />
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Description</h4>
                              <p className="text-sm">{alert.description}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Affected Sectors</h4>
                              <div className="flex flex-wrap gap-1">
                                {alert.affectedSectors.map(sector => (
                                  <Badge key={sector} variant="outline">
                                    <Tag size={12} className="mr-1" />
                                    {sector}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => window.open(alert.link, '_blank')}
                              >
                                <ExternalLink size={14} />
                                View Full Details
                              </Button>
                              
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span className="mr-2">Relevance score:</span>
                                <div className="bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                                  {alert.relevanceScore}/100
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Regulatory; 