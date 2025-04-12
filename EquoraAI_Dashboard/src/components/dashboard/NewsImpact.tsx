import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ExternalLink } from 'lucide-react';
import axios from 'axios';

// News item interface based on Alpha Vantage API response structure
interface NewsItem {
  title: string;
  summary: string;
  url: string;
  time_published: string;
  authors?: string[];
  banner_image?: string;
  source: string;
  category_within_source?: string;
  source_domain?: string;
  overall_sentiment_score?: number;
  overall_sentiment_label?: string;
}

interface NewsImpactProps {
  tickers?: string;
  topics?: string;
  limit?: number;
}

const NewsImpact: React.FC<NewsImpactProps> = ({ 
  tickers = 'AAPL,MSFT,GOOGL,AMZN,META', 
  topics = '',
  limit = 10 
}) => {
  // State to store news data, loading state, and error state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data directly from Alpha Vantage API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Set loading state to true when starting request
        setIsLoading(true);
        setError(null);
        
        // Directly fetch from Alpha Vantage API
        const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
        let url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${API_KEY}`;
        
        if (tickers) {
          url += `&tickers=${tickers}`;
        }
        if (topics) {
          url += `&topics=${topics}`;
        }
        if (limit) {
          url += `&limit=${limit}`;
        }
        
        console.log("Requesting URL:", url);
        const response = await axios.get(url);
        console.log("API Response:", response.data);
        
        // Handle rate limit or error messages
        if (response.data.Note) {
          throw new Error(response.data.Note);
        }
        if (response.data["Error Message"]) {
          throw new Error(response.data["Error Message"]);
        }
        
        // Check various possible response formats
        let newsItems: NewsItem[] = [];
        
        if (response.data.feed && Array.isArray(response.data.feed)) {
          // Standard format
          newsItems = response.data.feed;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // Alternative format
          newsItems = response.data.items;
        } else if (response.data.articles && Array.isArray(response.data.articles)) {
          // Another possible format
          newsItems = response.data.articles;
        } else if (Array.isArray(response.data)) {
          // Direct array format
          newsItems = response.data;
        } else {
          console.log("Unknown response format:", response.data);
          throw new Error("Unknown API response format");
        }
        
        // Update state with received news
        setNews(newsItems);
      } catch (err) {
        // Handle and display errors
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching news:', err);
      } finally {
        // Always set loading to false when done
        setIsLoading(false);
      }
    };

    // Execute the fetch function
    fetchNews();
    
    // Dependency array includes props to refetch if they change
  }, [tickers, topics, limit]);

  // Format date from API timestamp (YYYYMMDDTHHMMSS)
  const formatDate = (timestamp: string) => {
    if (!timestamp || timestamp.length < 8) return 'Unknown date';
    
    try {
      // Extract date parts from the timestamp format YYYYMMDDTHHMMSS
      const year = timestamp.substring(0, 4);
      const month = timestamp.substring(4, 6);
      const day = timestamp.substring(6, 8);
      
      // Create a formatted date string
      return `${month}/${day}/${year}`;
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full glassmorphism">
        <CardContent className="pt-6 flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading financial news...</p>
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
          Failed to load news data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Render news items
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Market News</CardTitle>
        <CardDescription>Latest financial news and market impact</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.length === 0 ? (
          <p>No news articles available.</p>
        ) : (
          news.map((item, index) => (
            <div 
              key={index} 
              className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-medium text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.source} • {formatDate(item.time_published)}
                  </p>
                  <p className="text-sm line-clamp-3">{item.summary}</p>
                  
                  <div className="flex items-center mt-2">
                    {item.overall_sentiment_label && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.overall_sentiment_label === 'Bullish' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                        item.overall_sentiment_label === 'Bearish' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      }`}>
                        {item.overall_sentiment_label}
                      </span>
                    )}
                    
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center hover:underline ml-auto"
                    >
                      Read more <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
                {item.banner_image && (
                  <img 
                    src={item.banner_image} 
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded" 
                  />
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NewsImpact;
