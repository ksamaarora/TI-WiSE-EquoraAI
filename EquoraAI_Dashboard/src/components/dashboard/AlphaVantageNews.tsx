import { useState, useEffect } from 'react';
import { getNewsSentiment } from '../../services/newsSentimentService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { ExternalLink } from 'lucide-react';

// News item interface based on Alpha Vantage API response structure
interface NewsItem {
  title: string;
  summary: string;
  url: string;
  time_published: string;
  authors: string[];
  banner_image?: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  overall_sentiment_score?: number;
  overall_sentiment_label?: string;
}

// Main component for displaying Alpha Vantage news
export default function AlphaVantageNews() {
  // State to store news data, loading state, and error state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data when component mounts
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Set loading state to true when starting request
        setIsLoading(true);
        setError(null);
        
        // Fetch news data using the existing service
        // This keeps API key secure by using environment variables
        const response = await getNewsSentiment('AAPL,MSFT,GOOGL', '', '', '', 'LATEST', 10);
        
        // Handle the case where data might not exist or has incorrect format
        if (!response.feed || !Array.isArray(response.feed)) {
          throw new Error('Invalid response format from API');
        }
        
        // Update state with received news
        setNews(response.feed);
      } catch (err) {
        // Handle and display errors
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching news:', err);
      } finally {
        // Always set loading to false when done
        setIsLoading(false);
      }
    };

    // Execute the fetch function
    fetchNews();
    
    // Empty dependency array means this effect runs once on mount
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
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.source} • {formatDate(item.time_published)}
                    </p>
                    <p className="text-sm line-clamp-3">{item.summary}</p>
                  </div>
                  {item.banner_image && (
                    <img 
                      src={item.banner_image} 
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded" 
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-4 py-2">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  Read more <ExternalLink className="ml-1 h-3 w-3" />
                </a>
                {item.overall_sentiment_label && (
                  <span className={`ml-auto text-xs px-2 py-1 rounded ${
                    item.overall_sentiment_label === 'Bullish' ? 'bg-green-100 text-green-800' : 
                    item.overall_sentiment_label === 'Bearish' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.overall_sentiment_label}
                  </span>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
} 