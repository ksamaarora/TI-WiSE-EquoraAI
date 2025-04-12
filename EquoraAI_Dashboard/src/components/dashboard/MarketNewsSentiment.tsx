// src/components/dashboard/MarketNewsSentiment.tsx
import React, { useEffect, useState } from 'react';
import { getNewsSentiment } from '@/services/newsSentimentService';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Article {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  topics: { topic: string; relevance_score: string }[];
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment?: any[];
}

const sentimentColors: { [key: string]: string } = {
  Bullish: "#00C49F",
  "Somewhat-Bullish": "#0088FE",
  Neutral: "#FFBB28",
  "Somewhat-Bearish": "#FF8042",
  Bearish: "#FF0000",
};

const MarketNewsSentiment: React.FC = () => {
  const [newsData, setNewsData] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sentimentDistribution, setSentimentDistribution] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Fetch news sentiment for a set of tickers (you can adjust the list)
        const data = await getNewsSentiment("AAPL,MSFT,AMZN,GOOGL,META,TSLA,NFLX,NVDA,IBM,INTC,CSCO");
        if (data && data.feed) {
          setNewsData(data.feed);
          // Compute overall sentiment distribution
          const distribution: { [key: string]: number } = {};
          data.feed.forEach((article: Article) => {
            const label = article.overall_sentiment_label;
            distribution[label] = (distribution[label] || 0) + 1;
          });
          const distributionArray = Object.keys(distribution).map((key) => ({
            sentiment: key,
            count: distribution[key],
          }));
          setSentimentDistribution(distributionArray);
        } else {
          setError("No news data found");
        }
      } catch (err) {
        setError("Failed to fetch news sentiment data");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <p>Loading market news & sentiment...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Market News & Sentiment</h2>
      <div className="mb-8" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={sentimentDistribution}
              dataKey="count"
              nameKey="sentiment"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {sentimentDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={sentimentColors[entry.sentiment] || "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Latest Articles</h3>
        <ul>
          {newsData.map((article, index) => (
            <li key={index} className="mb-4 border-b pb-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold"
              >
                {article.title}
              </a>
              <p className="text-sm text-gray-500">
                {article.source} - {article.time_published}
              </p>
              <p>{article.summary}</p>
              <p
                style={{ color: sentimentColors[article.overall_sentiment_label] || "#000" }}
                className="mt-1 font-semibold"
              >
                Sentiment: {article.overall_sentiment_label} (Score:{" "}
                {article.overall_sentiment_score})
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MarketNewsSentiment;
