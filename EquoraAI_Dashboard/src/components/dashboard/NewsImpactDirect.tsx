import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ExternalLink } from 'lucide-react';
import axios from 'axios';

// Based on the example API response structure
interface NewsFeed {
  items: string;
  sentiment_score_definition: string;
  relevance_score_definition: string;
  feed: NewsItem[];
}

interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  authors?: string[];
  summary: string;
  banner_image?: string;
  source: string;
  category_within_source?: string;
  source_domain?: string;
  topics?: any[];
  overall_sentiment_score?: number;
  overall_sentiment_label?: string;
  ticker_sentiment?: any[];
}

const NewsImpactDirect: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        
        // Use the same URL from your example
        const apiKey = 'ENVZWD4RMWCC6EVQ'; // Your API key
        const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&apikey=${apiKey}`;
        
        console.log("Fetching news from:", url);
        
        // Make the request using Axios
        const response = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        console.log("Raw API response:", response.data);
        
        // Check for error messages
        if (response.data.Note) {
          throw new Error(response.data.Note);
        }
        
        if (response.data["Error Message"]) {
          throw new Error(response.data["Error Message"]);
        }
        
        // Process the response data
        if (response.data.feed && Array.isArray(response.data.feed)) {
          setNews(response.data.feed);
        } else {
          console.error("Unexpected response format:", response.data);
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error("Error fetching news:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
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
      <Card className="w-full">
        <CardContent className="flex justify-center items-center p-6 h-48">
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financial News</CardTitle>
        <CardDescription>Latest news from Alpha Vantage API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.length === 0 ? (
          <p>No news articles available.</p>
        ) : (
          news.map((item, index) => (
            <div 
              key={index} 
              className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
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
                        item.overall_sentiment_label === 'Bullish' ? 'bg-green-100 text-green-800' : 
                        item.overall_sentiment_label === 'Bearish' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
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

export default NewsImpactDirect; 