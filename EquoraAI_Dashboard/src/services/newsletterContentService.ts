import { NewsletterEmail } from './emailService';
import { NewsletterPreferences } from './newsletterService';

// Mock market data sources
const marketIndices = [
  { name: 'S&P 500', value: 4783.56, change: 1.21 },
  { name: 'NASDAQ', value: 15962.24, change: 1.56 },
  { name: 'Dow Jones', value: 38765.32, change: 0.87 },
  { name: 'Russell 2000', value: 2031.67, change: -0.32 },
];

const topPerformingStocks = [
  { name: 'Nvidia', ticker: 'NVDA', price: 937.45, change: 3.75 },
  { name: 'Microsoft', ticker: 'MSFT', price: 421.98, change: 2.46 },
  { name: 'Apple', ticker: 'AAPL', price: 198.36, change: 1.23 },
  { name: 'Amazon', ticker: 'AMZN', price: 185.35, change: 2.87 },
  { name: 'Tesla', ticker: 'TSLA', price: 185.22, change: -1.45 },
  { name: 'Meta', ticker: 'META', price: 493.50, change: 4.12 },
  { name: 'Google', ticker: 'GOOGL', price: 173.65, change: 1.63 },
  { name: 'Netflix', ticker: 'NFLX', price: 645.20, change: 0.89 },
];

const marketNews = [
  {
    title: 'Fed Signals Interest Rate Cuts',
    summary: 'Federal Reserve signals potential interest rate cuts in the coming months as inflation cools.',
    url: 'https://example.com/fed-signals-rate-cuts',
    category: 'economy'
  },
  {
    title: 'Nvidia Announces New AI Chip',
    summary: 'Nvidia unveils its next-generation AI chip with 2x performance increase over previous models.',
    url: 'https://example.com/nvidia-new-ai-chip',
    category: 'technology'
  },
  {
    title: 'Oil Prices Surge Amid Middle East Tensions',
    summary: 'Crude oil prices jump 5% as geopolitical tensions in the Middle East escalate.',
    url: 'https://example.com/oil-prices-surge',
    category: 'commodities'
  },
  {
    title: 'Apple Reports Strong Quarterly Earnings',
    summary: 'Apple exceeds analyst expectations with strong iPhone sales and growing services revenue.',
    url: 'https://example.com/apple-earnings',
    category: 'earnings'
  },
  {
    title: 'U.S. Unemployment Rate Falls to 3.5%',
    summary: 'Job market remains resilient as unemployment rate drops to 3.5%, adding 275,000 jobs in June.',
    url: 'https://example.com/unemployment-falls',
    category: 'economy'
  },
  {
    title: 'Crypto Market Rebounds as Bitcoin Crosses $50K',
    summary: 'Bitcoin surges past $50,000 mark, leading a broader cryptocurrency market recovery.',
    url: 'https://example.com/crypto-rebounds',
    category: 'crypto'
  },
];

const marketInsights = [
  'Investors should consider diversifying portfolios amid growing volatility in tech stocks.',
  'Defensive sectors show resilience as market rotation continues from growth to value.',
  'International markets present opportunities as U.S. equities appear increasingly overvalued.',
  'Small-cap stocks may benefit from domestic economic strength and lower sensitivity to global headwinds.',
  'Dividend-yielding stocks offer attractive income potential in the current interest rate environment.',
];

const marketPredictions = [
  'AI analysis suggests the S&P 500 may test new highs in the coming weeks, with a projected target of 5000.',
  'Our models indicate a 65% probability of a minor market correction (5-7%) within the next 30 days.',
  'Sector rotation is expected to favor healthcare and consumer staples in the third quarter.',
  'Bond yields are projected to stabilize as inflation pressures continue to moderate.',
  'Algorithmic analysis points to potential outperformance of cybersecurity and semiconductor sectors.',
];

class NewsletterContentService {
  /**
   * Generate personalized newsletter content based on user preferences
   */
  generateNewsletterContent(preferences: NewsletterPreferences): Omit<NewsletterEmail, 'email'> {
    // Determine what content to include based on preferences
    const includeSectorAnalysis = preferences.includeSectorAnalysis !== false;
    const includeTopStocks = preferences.includeTopStocks !== false;
    const includeNewsDigest = preferences.includeNewsDigest !== false;
    const includePredictions = preferences.includePredictions === true;
    
    // Generate a subject line based on market performance
    const overallMarketChange = marketIndices.reduce((acc, index) => acc + index.change, 0) / marketIndices.length;
    const marketDirection = overallMarketChange > 0 ? 'Up' : 'Down';
    const subject = `EquoraAI Market Newsletter: Markets ${marketDirection} ${Math.abs(overallMarketChange).toFixed(1)}%`;
    
    // Create greeting based on frequency
    const greeting = this.createGreeting(preferences.frequency);
    
    // Create market summary
    const marketSummary = this.createMarketSummary(marketIndices);
    
    // Select top stocks
    const stocks = this.selectTopStocks(includeTopStocks ? 5 : 0);
    
    // Select news items
    const news = this.selectNews(includeNewsDigest ? 3 : 0);
    
    // Generate insights
    const insights = this.generateInsights(includeSectorAnalysis);
    
    // Generate predictions if requested
    const predictions = includePredictions ? this.generatePredictions() : undefined;
    
    // Standard disclaimer
    const disclaimer = 'This newsletter is for informational purposes only and does not constitute investment advice. ' +
                       'Past performance is not indicative of future results. Investing involves risk, including possible loss of principal.';
    
    return {
      subject,
      content: {
        greeting,
        marketSummary,
        topStocks: stocks,
        keyNews: news,
        insights,
        predictions,
        disclaimer
      }
    };
  }
  
  private createGreeting(frequency: string): string {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    switch (frequency) {
      case 'daily':
        return `Here's your daily market update for ${formattedDate}. Get ready to make informed decisions today!`;
      case 'weekly':
        return `Welcome to your weekly market roundup for the week ending ${formattedDate}. Here's what you need to know!`;
      case 'monthly':
        return `Here's your monthly market overview for ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Let's review the key developments!`;
      default:
        return `Welcome to your market update for ${formattedDate}. Stay informed with the latest developments!`;
    }
  }
  
  private createMarketSummary(indices: typeof marketIndices): string {
    const overallDirection = indices.reduce((acc, index) => acc + index.change, 0) > 0 ? 'positive' : 'negative';
    
    // Generate a random summary each time based on the overall market direction
    const positiveSummaries = [
      `Markets traded higher today with broad-based gains. The ${indices[0].name} rose ${indices[0].change.toFixed(2)}% to ${indices[0].value.toFixed(2)}, while the ${indices[1].name} increased by ${indices[1].change.toFixed(2)}% to ${indices[1].value.toFixed(2)}. Investor sentiment remains optimistic amid promising economic data.`,
      `Stocks rallied as investors cheered better-than-expected economic reports. The ${indices[0].name} climbed ${indices[0].change.toFixed(2)}% to ${indices[0].value.toFixed(2)}, with all major indices in the green. Tech and financial sectors led the gains.`,
      `Markets continued their upward momentum, with the ${indices[0].name} adding ${indices[0].change.toFixed(2)}% to close at ${indices[0].value.toFixed(2)}. Positive corporate earnings and easing inflation concerns supported investor confidence.`
    ];
    
    const negativeSummaries = [
      `Markets retreated today as investors weighed economic concerns. The ${indices[0].name} fell ${Math.abs(indices[0].change).toFixed(2)}% to ${indices[0].value.toFixed(2)}, while the ${indices[1].name} dropped ${Math.abs(indices[1].change).toFixed(2)}% to ${indices[1].value.toFixed(2)}. Defensive sectors showed relative strength amid the broader selloff.`,
      `Stocks declined amid mixed economic signals and profit-taking after recent gains. The ${indices[0].name} slipped ${Math.abs(indices[0].change).toFixed(2)}% to ${indices[0].value.toFixed(2)}, with most sectors ending in negative territory.`,
      `Markets pulled back as investors reassessed valuations and economic outlook. The ${indices[0].name} shed ${Math.abs(indices[0].change).toFixed(2)}% to close at ${indices[0].value.toFixed(2)}. Heightened volatility suggests caution among market participants.`
    ];
    
    const summaries = overallDirection === 'positive' ? positiveSummaries : negativeSummaries;
    return summaries[Math.floor(Math.random() * summaries.length)];
  }
  
  private selectTopStocks(count: number): typeof topPerformingStocks {
    if (count === 0) return [];
    
    // Sort by absolute change to get most movement (positive or negative)
    const sortedStocks = [...topPerformingStocks].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    return sortedStocks.slice(0, count);
  }
  
  private selectNews(count: number): typeof marketNews {
    if (count === 0) return [];
    
    // Shuffle the news array to get random news each time
    const shuffled = [...marketNews].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  private generateInsights(includeSectorAnalysis: boolean): string {
    let insight = marketInsights[Math.floor(Math.random() * marketInsights.length)];
    
    if (includeSectorAnalysis) {
      const sectorInsights = [
        'Technology sector continues to show strength, with semiconductor stocks leading the advance.',
        'Healthcare stocks are showing defensive characteristics amid market volatility.',
        'Financial sector benefits from steepening yield curve and potential for higher interest rates.',
        'Energy stocks face headwinds due to fluctuating commodity prices and regulatory pressures.',
      ];
      
      insight += ' ' + sectorInsights[Math.floor(Math.random() * sectorInsights.length)];
    }
    
    return insight;
  }
  
  private generatePredictions(): string {
    return marketPredictions[Math.floor(Math.random() * marketPredictions.length)];
  }
}

// Create and export a singleton instance
export const newsletterContentService = new NewsletterContentService(); 