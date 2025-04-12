# Alpha Vantage News Component

This component fetches and displays financial news from the Alpha Vantage API.

## Usage

Import and add the component to any page or dashboard:

```tsx
import AlphaVantageNews from '../components/dashboard/AlphaVantageNews';

function YourDashboardPage() {
  return (
    <div className="grid gap-4">
      {/* Other dashboard components */}
      <AlphaVantageNews />
    </div>
  );
}
```

## Security Notes

This component uses the existing `newsSentimentService` which:

1. Stores the API key in environment variables (VITE_ALPHA_VANTAGE_KEY)
2. Implements caching to reduce API calls and stay within rate limits
3. Handles errors gracefully

## API Key Security Best Practices

For production applications:

1. **Never expose API keys in the frontend**: The current implementation using environment variables is acceptable for development but not ideal for production.
2. **Use a backend proxy**: Create a backend endpoint that makes the Alpha Vantage API calls and returns the data to the frontend.
3. **Implement rate limiting**: Alpha Vantage has rate limits (5-500 API requests per day depending on your plan).
4. **Cache responses**: The current service already implements caching to reduce API calls.

## Example Backend Proxy Implementation

For production, create a backend API endpoint:

```typescript
// Server-side endpoint
app.get('/api/news', async (req, res) => {
  try {
    const { tickers, limit } = req.query;
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${tickers}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});
```

Then update the frontend service to call your backend endpoint instead of directly calling Alpha Vantage. 