import React, { useEffect, useState } from 'react';
import { sentimentService, SentimentData } from '@/services/sentimentService';
import { 
  AlertCircle, 
  Bell, 
  Menu, 
  X, 
  Accessibility, 
  Briefcase, 
  Bitcoin, 
  FileText, 
  BarChart, 
  DollarSign, 
  MessagesSquare, 
  CalendarClock, 
  MailPlus,
  Home,
  LineChart,
  TrendingUp,
  Newspaper,
  Landmark,
  Lightbulb,
  Settings,
  User,
  LogOut,
  Building2,
  Layers,
  PieChart,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessibility } from '@/lib/accessibility';
import NewsletterDialog from './NewsletterDialog';
import LiveDataTicker from './LiveDataTicker';
import { logOut } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, speakText, navigationVoice } = useAccessibility();
  const { user } = useAuth();
  
  // Scroll to top when path changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  useEffect(() => {
    // Subscribe to sentiment data updates
    const unsubscribe = sentimentService.subscribe(newData => {
      setData(newData);
    });
    
    // Start real-time updates
    const stopUpdates = sentimentService.startRealTimeUpdates();
    
    // Clean up on component unmount
    return () => {
      unsubscribe();
      stopUpdates();
    };
  }, []);

  // Get sentiment color class for header
  const getSentimentHeaderClass = () => {
    if (!data) return 'bg-gradient-to-r from-blue-600/90 to-blue-500/90';
    
    if (data.overallSentiment > 0.2) {
      return 'bg-gradient-to-r from-green-600/90 to-green-500/90';
    }
    
    if (data.overallSentiment < -0.2) {
      return 'bg-gradient-to-r from-red-600/90 to-red-500/90';
    }
    
    return 'bg-gradient-to-r from-blue-600/90 to-blue-500/90';
  };

  // Navigation sections and items
  const navSections = [
    {
      title: "Overview",
      items: [
        { name: 'Dashboard', path: '/', icon: <Home size={16} /> },
      ]
    },
    {
      title: "Markets",
      items: [
        { name: 'Market Overview', path: '/sector-analysis', icon: <TrendingUp size={16} /> },
        { name: 'Stock Sentiment', path: '/stock-sentiment', icon: <BarChart size={16} /> },
        { name: 'Global Market Status', path: '/global-market-status', icon: <Landmark size={16} /> },
        { name: 'Ticker Search', path: '/ticker-search', icon: <Search size={16} /> },
        { name: 'Forex Analysis', path: '/forex-analysis', icon: <DollarSign size={16} /> },
        { name: 'News Impact', path: '/news-impact', icon: <Newspaper size={16} /> },
        { name: 'Cryptocurrency', path: '/cryptocurrency', icon: <TrendingUp size={16} /> },
        { name: 'Crypto News', path: '/crypto-news', icon: <Newspaper size={16} /> },
        { name: 'Portfolio', path: '/portfolio', icon: <Layers size={16} /> },
        { name: 'Financial Planning', path: '/financial-planning', icon: <DollarSign size={16} /> },
        { name: 'Crypto View', path: '/crypto-view', icon: <Bitcoin size={16} /> },
        { name: 'Earnings Transcript', path: '/earnings-transcript', icon: <FileText size={16} /> },
      ]
    },
    {
      title: "Insights",
      items: [
        { name: 'Visualizations', path: '/visualizations', icon: <BarChart size={16} /> },
        { name: 'Predictions', path: '/predictions', icon: <Lightbulb size={16} /> },
        { name: 'Calendar', path: '/calendar', icon: <CalendarClock size={16} /> },
        { name: 'Discussions', path: '/discussions', icon: <MessagesSquare size={16} /> },
      ]
    },
    {
      title: "Account",
      items: [
        { name: 'Profile', path: '/profile', icon: <User size={16} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={16} /> },
      ]
    }
  ];

  // Handle navigation item click
  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMenuOpen(false);
    }
    if (navigationVoice) {
      speakText(`Navigating to ${path.replace('/', '')}`);
    }
  };
  
  // Handle text-to-speech for navigation items
  const handleSpeakNavItem = (navName: string) => {
    if (navigationVoice) {
      speakText(navName);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col overflow-x-hidden", theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50')}>
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b px-4 py-3 flex items-center justify-between shadow-sm",
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "p-2 rounded-md mr-2",
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            )}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-xl font-bold">EquoraAI Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {user && (
            <div className="flex items-center mr-4">
              <span className="text-sm mr-2">{user.email}</span>
              <button
                onClick={handleLogout}
                className={cn(
                  "p-2 rounded-md flex items-center",
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                )}
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-accessibility'))}
            className={cn(
              "p-2 rounded-md",
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            )}
            aria-label="Accessibility settings"
          >
            <Accessibility size={20} />
          </button>
          <button
            onClick={() => setShowNewsletterDialog(true)}
            className={cn(
              "p-2 rounded-md",
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            )}
            aria-label="Newsletter"
          >
            <MailPlus size={20} />
          </button>
          <button
            className={cn(
              "p-2 rounded-md",
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            )}
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
        </div>
      </header>
      
      {/* Live Data Ticker */}
      <div className="fixed top-[56px] left-0 right-0 z-40 w-full">
        <LiveDataTicker />
      </div>
      
      {/* Main content with scrolling sidebar */}
      <main className="flex flex-1 h-screen overflow-hidden pt-[92px]" id="main-content">
        {/* Sidebar for navigation on larger screens */}
        <aside
          className={cn(
            "w-64 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-r border-border z-10 transition-all duration-300 ease-in-out h-full",
            isMobile ? "fixed inset-y-0 left-0 transform" : "fixed top-[92px] bottom-0 left-0",
            isMobile && !menuOpen ? "-translate-x-full" : "translate-x-0"
          )}
          aria-label="Navigation sidebar"
          aria-hidden={isMobile && !menuOpen}
        >
          <div className="h-full flex flex-col p-4 overflow-y-auto">
            <div className="py-4">
              <h2 className="text-lg font-medium text-primary">Dashboard</h2>
            </div>

            <nav className="flex-1" aria-label="Main navigation">
              {navSections.map((section, idx) => (
                <div key={section.title} className={idx > 0 ? "mt-6" : ""}>
                  <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          handleNavClick(item.path);
                          handleSpeakNavItem(item.name);
                          window.scrollTo(0, 0);
                        }}
                        className={cn(
                          "w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                          location.pathname === item.path
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-secondary text-foreground/80 hover:text-foreground"
                        )}
                        aria-current={location.pathname === item.path ? "page" : undefined}
                      >
                        <span className="flex-shrink-0 text-foreground/70">{item.icon}</span>
                        <span>{item.name}</span>
                        {location.pathname === item.path && (
                          <span className="sr-only">(current page)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            
            {/* Newsletter subscription */}
            <div className="mt-6 pt-6 border-t border-border">
              <button
                onClick={() => setShowNewsletterDialog(true)}
                className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md transition-colors hover:bg-secondary bg-primary/5"
              >
                <span className="flex-shrink-0 text-primary/70"><MailPlus size={16} /></span>
                <span>Subscribe to Newsletter</span>
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main dashboard content with improved background and scrolling */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br ml-0 md:ml-64",
          theme === 'dark' 
            ? "from-gray-900 to-blue-950" 
            : "from-blue-50 to-indigo-50"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
      {/* Backdrop for mobile menu */}
      {isMobile && menuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Newsletter Dialog */}
      <NewsletterDialog 
        open={showNewsletterDialog} 
        onOpenChange={setShowNewsletterDialog} 
      />
    </div>
  );
};

export default DashboardLayout;
