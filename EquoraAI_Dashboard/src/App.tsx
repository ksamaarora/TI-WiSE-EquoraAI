import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { AccessibilityProvider } from '@/lib/accessibility';
import AccessibilityPanel from '@/components/ui/accessibility-panel';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import PasswordGate from './components/auth/PasswordGate';

import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import SectorAnalysis from '@/pages/MarketOverview';
import StockSentiment from '@/pages/StockSentiment';
import NewsImpact from '@/pages/NewsImpact';
import NewsSentimentPage from '@/pages/NewsSentiment';
import Predictions from '@/pages/Predictions';
import Portfolio from '@/pages/Portfolio';
import Cryptocurrency from '@/pages/Cryptocurrency';
import CryptoView from '@/pages/CryptoView';
import EarningsTranscript from '@/pages/EarningsTranscript';
import Regulatory from '@/pages/Regulatory';
import Visualizations from '@/pages/Visualizations';
import FinancialPlanning from '@/pages/FinancialPlanning';
import Discussions from '@/pages/Discussions';
import TestPage from '@/pages/TestPage';
import SimpleIndex from '@/pages/SimpleIndex';
import Calendar from '@/pages/Calendar';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import CompanyOverview from '@/pages/CompanyOverview';
import ChatPage from '@/pages/ChatPage';
import GlobalMarketStatus from '@/pages/GlobalMarketStatus';
import TickerSearch from '@/pages/TickerSearch';
import ForexAnalysis from '@/pages/ForexAnalysis';
import CryptoNews from '@/pages/CryptoNews';

import './App.css';
// Import our accessibility styles
import '@/lib/accessibility.css';
// Import map z-index fixes
import '@/lib/map-fix.css';

// Create a client
const queryClient = new QueryClient();

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PasswordGate>
        <AuthProvider>
          <AccessibilityProvider>
            <TooltipProvider>
              <ErrorBoundary>
                <Router>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/simple" element={<ProtectedRoute><SimpleIndex /></ProtectedRoute>} />
                    <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
                    <Route path="/sector-analysis" element={<ProtectedRoute><SectorAnalysis /></ProtectedRoute>} />
                    <Route path="/stock-sentiment" element={<ProtectedRoute><StockSentiment /></ProtectedRoute>} />
                    <Route path="/news-impact" element={<ProtectedRoute><NewsImpact /></ProtectedRoute>} />
                    <Route path="/news-sentiment" element={<ProtectedRoute><NewsSentimentPage /></ProtectedRoute>} />
                    <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
                    <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                    <Route path="/cryptocurrency" element={<ProtectedRoute><Cryptocurrency /></ProtectedRoute>} />
                    <Route path="/crypto-view" element={<ProtectedRoute><CryptoView /></ProtectedRoute>} />
                    <Route path="/earnings-transcript" element={<ProtectedRoute><EarningsTranscript /></ProtectedRoute>} />
                    <Route path="/regulatory" element={<ProtectedRoute><Regulatory /></ProtectedRoute>} />
                    <Route path="/visualizations" element={<ProtectedRoute><Visualizations /></ProtectedRoute>} />
                    <Route path="/financial-planning" element={<ProtectedRoute><FinancialPlanning /></ProtectedRoute>} />
                    <Route path="/discussions" element={<ProtectedRoute><Discussions /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                    <Route path="/company-overview" element={<ProtectedRoute><CompanyOverview /></ProtectedRoute>} />
                    <Route path="/global-market-status" element={<ProtectedRoute><GlobalMarketStatus /></ProtectedRoute>} />
                    <Route path="/ticker-search" element={<ProtectedRoute><TickerSearch /></ProtectedRoute>} />
                    <Route path="/forex-analysis" element={<ProtectedRoute><ForexAnalysis /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    <Route path="/chat/:roomId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    <Route path="crypto-news" element={<CryptoNews />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <AccessibilityPanel />
                </Router>
              </ErrorBoundary>
            </TooltipProvider>
          </AccessibilityProvider>
        </AuthProvider>
      </PasswordGate>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
