// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format percentage
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero'
  }).format(value / 100);
}

// Format large numbers with K, M, B suffixes
export function formatCompactNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  });
  
  return formatter.format(num);
}

// Format a date string to a more readable format
export function formatDate(dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  if (format === 'short') {
    delete options.year;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

// Format a date to show how long ago it occurred
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  
  // Otherwise, return formatted date
  return formatDate(dateString, 'short');
}

// Get CSS class for sentiment score
export function getSentimentClass(sentiment: number): string {
  if (sentiment > 0.2) return 'sentiment-positive';
  if (sentiment < -0.2) return 'sentiment-negative';
  return 'sentiment-neutral';
}

// Get symbol for sentiment direction
export function getSentimentSymbol(sentiment: number): string {
  if (sentiment > 0.2) return '↑';
  if (sentiment < -0.2) return '↓';
  return '→';
}

// Get human-readable sentiment description
export function getSentimentDescription(sentiment: number): string {
  if (sentiment > 0.6) return 'Very Bullish';
  if (sentiment > 0.2) return 'Bullish';
  if (sentiment > -0.2) return 'Neutral';
  if (sentiment > -0.6) return 'Bearish';
  return 'Very Bearish';
}

// Get color for sentiment visualization
export function getSentimentColor(sentiment: number): string {
  if (sentiment > 0.6) return 'rgb(0, 200, 83)';
  if (sentiment > 0.2) return 'rgb(75, 181, 67)';
  if (sentiment > -0.2) return 'rgb(107, 114, 128)';
  if (sentiment > -0.6) return 'rgb(239, 68, 68)';
  return 'rgb(220, 38, 38)';
}

// Calculate gradient colors for sentiment visualization
export function getSentimentGradient(sentiment: number): string {
  if (sentiment > 0.2) {
    // Green gradient for positive
    const intensity = Math.min(1, (sentiment + 0.2) / 1.2);
    return `rgba(75, 181, 67, ${intensity})`;
  }
  
  if (sentiment < -0.2) {
    // Red gradient for negative
    const intensity = Math.min(1, (Math.abs(sentiment) + 0.2) / 1.2);
    return `rgba(239, 68, 68, ${intensity})`;
  }
  
  // Gray for neutral
  return 'rgba(107, 114, 128, 0.5)';
}
