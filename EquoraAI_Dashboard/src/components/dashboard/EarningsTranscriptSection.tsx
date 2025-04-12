import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FileText, RefreshCw, TrendingUp, TrendingDown, Search, User, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALPHA_VANTAGE_KEY = 'ENVZWD4RMWCC6EVQ';

// Common company symbols
const COMPANY_SYMBOLS = [
  { value: 'IBM', label: 'IBM' },
  { value: 'AAPL', label: 'Apple' },
  { value: 'MSFT', label: 'Microsoft' },
  { value: 'GOOGL', label: 'Google' },
  { value: 'AMZN', label: 'Amazon' },
  { value: 'META', label: 'Meta' },
  { value: 'TSLA', label: 'Tesla' },
  { value: 'NVDA', label: 'NVIDIA' },
];

// Available quarters (most recent first)
const QUARTERS = [
  { value: '2024Q1', label: 'Q1 2024' },
  { value: '2023Q4', label: 'Q4 2023' },
  { value: '2023Q3', label: 'Q3 2023' },
  { value: '2023Q2', label: 'Q2 2023' },
  { value: '2023Q1', label: 'Q1 2023' },
];

// Colors for sentiment visualization
const SENTIMENT_COLORS = {
  positive: '#22c55e', // green
  neutral: '#6366f1',  // blue
  negative: '#ef4444', // red
};

// Colors for pie charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface TranscriptSegment {
  speaker: string;
  title: string;
  content: string;
  sentiment: string;
}

interface TranscriptData {
  symbol: string;
  quarter: string;
  transcript: TranscriptSegment[];
}

interface WordCloudData {
  text: string;
  value: number;
}

const EarningsTranscriptSection: React.FC = () => {
  const [companySymbol, setCompanySymbol] = useState<string>('IBM');
  const [quarter, setQuarter] = useState<string>('2024Q1');
  const [selectedTab, setSelectedTab] = useState<string>('transcript');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Function to fetch transcript data
  const fetchTranscriptData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://www.alphavantage.co/query?function=EARNINGS_CALL_TRANSCRIPT&symbol=${companySymbol}&quarter=${quarter}&apikey=${ALPHA_VANTAGE_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      if (data['Note']) {
        throw new Error(data['Note']); // API call limit reached message
      }
      
      // Check if expected data structure exists
      if (!data.transcript || !Array.isArray(data.transcript)) {
        throw new Error('Invalid transcript data received');
      }
      
      setTranscriptData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching transcript data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or when company/quarter changes
  useEffect(() => {
    fetchTranscriptData();
  }, [companySymbol, quarter]);

  // Get sentiment color based on score
  const getSentimentColor = (sentiment: string) => {
    const score = parseFloat(sentiment);
    if (score >= 0.6) return SENTIMENT_COLORS.positive;
    if (score <= 0.4) return SENTIMENT_COLORS.negative;
    return SENTIMENT_COLORS.neutral;
  };
  
  // Get sentiment text based on score
  const getSentimentText = (sentiment: string) => {
    const score = parseFloat(sentiment);
    if (score >= 0.6) return 'Positive';
    if (score <= 0.4) return 'Negative';
    return 'Neutral';
  };

  // Calculate aggregate sentiment data for charts
  const getSentimentChartData = () => {
    if (!transcriptData?.transcript) return [];
    
    return transcriptData.transcript.map((segment, index) => ({
      name: `${segment.speaker.split(' ')[0]}`,
      index,
      sentiment: parseFloat(segment.sentiment),
    }));
  };

  // Calculate speaker statistics
  const getSpeakerStats = () => {
    if (!transcriptData?.transcript) return [];
    
    const speakerMap = new Map<string, { count: number, wordCount: number, avgSentiment: number }>();
    
    transcriptData.transcript.forEach(segment => {
      const key = segment.speaker;
      const existing = speakerMap.get(key) || { count: 0, wordCount: 0, avgSentiment: 0 };
      
      existing.count += 1;
      existing.wordCount += segment.content.split(/\s+/).length;
      existing.avgSentiment = (existing.avgSentiment * (existing.count - 1) + parseFloat(segment.sentiment)) / existing.count;
      
      speakerMap.set(key, existing);
    });
    
    return Array.from(speakerMap.entries()).map(([name, stats]) => ({
      name,
      segments: stats.count,
      words: stats.wordCount,
      sentiment: stats.avgSentiment
    }));
  };

  // Prepare data for pie chart of speaking time distribution
  const getSpeakingTimeData = () => {
    const stats = getSpeakerStats();
    return stats.map(stat => ({
      name: stat.name.split(' ')[0],
      value: stat.words,
    }));
  };

  // Extract key terms from transcript
  const getKeyTerms = (): WordCloudData[] => {
    if (!transcriptData?.transcript) return [];
    
    // Combine all transcript content
    const allText = transcriptData.transcript.map(segment => segment.content).join(' ');
    
    // Remove common words and punctuation
    const stopWords = new Set(['and', 'the', 'to', 'of', 'a', 'in', 'that', 'is', 'for', 'we', 'our', 'i', 'with', 'as', 'on', 'at', 'by', 'an', 'be', 'this', 'which', 'or', 'from']);
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Count word frequency
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array and sort by frequency
    return Object.entries(wordCounts)
      .filter(([_, count]) => count > 2) // Only include words that appear multiple times
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30); // Get top 30 terms
  };

  // Filter transcript segments by search term
  const getFilteredTranscript = () => {
    if (!transcriptData?.transcript) return [];
    
    if (!searchTerm) return transcriptData.transcript;
    
    const term = searchTerm.toLowerCase();
    return transcriptData.transcript.filter(segment => 
      segment.content.toLowerCase().includes(term) || 
      segment.speaker.toLowerCase().includes(term) ||
      segment.title.toLowerCase().includes(term)
    );
  };

  // Custom tooltip for sentiment chart
  const SentimentTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p>Sentiment: {data.sentiment.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Segment {data.index + 1}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText size={20} />
              Earnings Call Transcript Analysis
            </CardTitle>
            <CardDescription>
              Analyze and visualize company earnings call transcripts
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={companySymbol}
              onValueChange={setCompanySymbol}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SYMBOLS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={quarter}
              onValueChange={setQuarter}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent>
                {QUARTERS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchTranscriptData}
              disabled={loading}
            >
              <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
            <p>{error}</p>
          </div>
        ) : null}

        {/* Summary Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-6 w-2/3 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : transcriptData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Company</div>
                <div className="text-xl font-semibold">{transcriptData.symbol}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {transcriptData.quarter}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Speakers</div>
                <div className="text-xl font-semibold">{getSpeakerStats().length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {transcriptData.transcript.length} segments
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Average Sentiment</div>
                <div className="flex items-center">
                  {(() => {
                    const avgSentiment = transcriptData.transcript.reduce((sum, seg) => 
                      sum + parseFloat(seg.sentiment), 0) / transcriptData.transcript.length;
                    
                    return (
                      <>
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getSentimentColor(avgSentiment.toString()) }}
                        />
                        <span className="text-xl font-semibold">{avgSentiment.toFixed(2)}</span>
                      </>
                    );
                  })()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(() => {
                    const avgSentiment = transcriptData.transcript.reduce((sum, seg) => 
                      sum + parseFloat(seg.sentiment), 0) / transcriptData.transcript.length;
                    return getSentimentText(avgSentiment.toString());
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="speakers">Speaker Breakdown</TabsTrigger>
            <TabsTrigger value="keywords">Key Terms</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <RefreshCw size={24} className="animate-spin mb-2" />
                <span>Loading transcript data...</span>
              </div>
            </div>
          ) : !transcriptData ? (
            <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
              No transcript data available
            </div>
          ) : (
            <>
              {/* Transcript Tab */}
              <TabsContent value="transcript" className="mt-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search transcript..."
                      className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <span>{getFilteredTranscript().length}</span>
                    <span>of</span>
                    <span>{transcriptData.transcript.length}</span>
                    <span>segments</span>
                  </Badge>
                </div>
                
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  {getFilteredTranscript().map((segment, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-muted-foreground" />
                          <div>
                            <span className="font-semibold">{segment.speaker}</span>
                            {segment.title && (
                              <span className="text-sm text-muted-foreground ml-2">
                                ({segment.title})
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge 
                          className="text-white" 
                          style={{ 
                            backgroundColor: getSentimentColor(segment.sentiment) 
                          }}
                        >
                          {getSentimentText(segment.sentiment)}
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 whitespace-pre-wrap">{segment.content}</p>
                      {index < getFilteredTranscript().length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              {/* Sentiment Analysis Tab */}
              <TabsContent value="sentiment" className="mt-0">
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getSentimentChartData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        label={{ 
                          value: 'Sentiment Score', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }} 
                      />
                      <Tooltip content={<SentimentTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="sentiment"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={true}
                        activeDot={{ r: 6 }}
                      />
                      {/* Reference lines for sentiment ranges */}
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <line 
                        x1="0%" 
                        y1="40%" 
                        x2="100%" 
                        y2="40%" 
                        stroke={SENTIMENT_COLORS.negative} 
                        strokeWidth={1} 
                        strokeDasharray="3 3" 
                      />
                      <line 
                        x1="0%" 
                        y1="60%" 
                        x2="100%" 
                        y2="60%" 
                        stroke={SENTIMENT_COLORS.positive} 
                        strokeWidth={1} 
                        strokeDasharray="3 3" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: SENTIMENT_COLORS.positive }}></div>
                    <span className="text-sm">Positive (&gt;= 0.6)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: SENTIMENT_COLORS.neutral }}></div>
                    <span className="text-sm">Neutral (0.4-0.6)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: SENTIMENT_COLORS.negative }}></div>
                    <span className="text-sm">Negative (&lt; 0.4)</span>
                  </div>
                </div>
              </TabsContent>

              {/* Speaker Breakdown Tab */}
              <TabsContent value="speakers" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Speaking Time Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getSpeakingTimeData()}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {getSpeakingTimeData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} words`, 'Word Count']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Speaker Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getSpeakerStats()}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis type="number" domain={[0, 1]} />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              width={60}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip formatter={(value) => [`${value}`, 'Sentiment Score']} />
                            <Bar 
                              dataKey="sentiment" 
                              name="Sentiment"
                              fill="#8884d8"
                              barSize={20}
                            >
                              {getSpeakerStats().map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={getSentimentColor(entry.sentiment.toString())} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Key Terms Tab */}
              <TabsContent value="keywords" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Frequently Mentioned Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getKeyTerms().slice(0, 15)}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis type="number" />
                            <YAxis 
                              type="category" 
                              dataKey="text" 
                              width={80}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip formatter={(value) => [`${value} occurrences`, 'Frequency']} />
                            <Bar 
                              dataKey="value" 
                              fill="#8884d8" 
                              name="Occurrences"
                              barSize={15}
                            >
                              {getKeyTerms().slice(0, 15).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Key Terms by Speaker</CardTitle>
                      <CardDescription className="text-xs">
                        Top terms used by each speaker
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        {getSpeakerStats().map((speaker, idx) => {
                          // Get terms specific to this speaker
                          const speakerSegments = transcriptData.transcript
                            .filter(segment => segment.speaker === speaker.name)
                            .map(segment => segment.content)
                            .join(' ');
                            
                          // Process speaker-specific terms
                          const stopWords = new Set(['and', 'the', 'to', 'of', 'a', 'in', 'that', 'is', 'for', 'we', 'our', 'i', 'with', 'as']);
                          const words = speakerSegments.toLowerCase()
                            .replace(/[^\w\s]/g, '')
                            .split(/\s+/)
                            .filter(word => word.length > 3 && !stopWords.has(word));
                          
                          const wordCounts = words.reduce((acc, word) => {
                            acc[word] = (acc[word] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                          const topTerms = Object.entries(wordCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([term, count]) => ({ term, count }));
                            
                          return (
                            <div key={idx} className={cn(idx > 0 && "mt-4")}>
                              <h4 className="font-medium text-sm mb-1">{speaker.name}</h4>
                              <div className="flex flex-wrap gap-1">
                                {topTerms.map((item, termIdx) => (
                                  <Badge key={termIdx} variant="outline" className="text-xs">
                                    {item.term} ({item.count})
                                  </Badge>
                                ))}
                              </div>
                              {idx < getSpeakerStats().length - 1 && (
                                <Separator className="mt-2" />
                              )}
                            </div>
                          );
                        })}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EarningsTranscriptSection; 