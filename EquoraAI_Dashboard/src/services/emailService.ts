import { toast } from "sonner";

// Interface for newsletter email content
export interface NewsletterEmail {
  email: string;
  subject: string;
  content: {
    greeting: string;
    marketSummary: string;
    topStocks: {
      name: string;
      ticker: string;
      price: number;
      change: number;
    }[];
    keyNews: {
      title: string;
      summary: string;
      url: string;
    }[];
    insights: string;
    predictions?: string;
    disclaimer: string;
  };
}

class EmailService {
  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html HTML email content
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // In a real application, this would use a proper email service like SendGrid, AWS SES, etc.
      // For demo purposes, we're simulating sending an email
      console.log(`Sending email to ${to}:`, { subject, html });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show a toast notification for demo purposes
      toast.success(`Newsletter sent to ${to}`);
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send newsletter email');
      return false;
    }
  }
  
  /**
   * Send a newsletter email
   * @param newsletterEmail Newsletter email content
   */
  async sendNewsletterEmail(newsletterEmail: NewsletterEmail): Promise<boolean> {
    try {
      const { email, subject, content } = newsletterEmail;
      
      // Generate HTML content for the newsletter
      const html = this.generateNewsletterHtml(content);
      
      // Send the email
      return await this.sendEmail(email, subject, html);
    } catch (error) {
      console.error('Failed to send newsletter email:', error);
      return false;
    }
  }
  
  /**
   * Generate HTML content for a newsletter email
   * @param content Newsletter content
   */
  private generateNewsletterHtml(content: NewsletterEmail['content']): string {
    // In a real application, you would use a proper HTML template with styling
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>EquoraAI Market Newsletter</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #1e40af;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .section {
            margin: 20px 0;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .stock-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .stock-change-positive {
            color: #10b981;
          }
          .stock-change-negative {
            color: #ef4444;
          }
          .news-item {
            margin-bottom: 15px;
          }
          .news-title {
            font-weight: bold;
          }
          .news-summary {
            margin: 5px 0;
          }
          .news-link {
            color: #2563eb;
            text-decoration: none;
          }
          .disclaimer {
            font-size: 12px;
            color: #666;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EquoraAI Market Newsletter</h1>
        </div>
        
        <div class="section">
          <h2>Hello,</h2>
          <p>${content.greeting}</p>
        </div>
        
        <div class="section">
          <h2>Market Summary</h2>
          <p>${content.marketSummary}</p>
        </div>
        
        <div class="section">
          <h2>Top Performing Stocks</h2>
          ${content.topStocks.map(stock => `
            <div class="stock-item">
              <div>
                <strong>${stock.name}</strong> (${stock.ticker})
              </div>
              <div>
                $${stock.price.toFixed(2)} 
                <span class="${stock.change >= 0 ? 'stock-change-positive' : 'stock-change-negative'}">
                  ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                </span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2>Key Market News</h2>
          ${content.keyNews.map(news => `
            <div class="news-item">
              <div class="news-title">${news.title}</div>
              <div class="news-summary">${news.summary}</div>
              <a href="${news.url}" class="news-link">Read more</a>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2>Market Insights</h2>
          <p>${content.insights}</p>
        </div>
        
        ${content.predictions ? `
        <div class="section">
          <h2>AI Predictions</h2>
          <p>${content.predictions}</p>
        </div>
        ` : ''}
        
        <div class="disclaimer">
          <p>${content.disclaimer}</p>
        </div>
      </body>
      </html>
    `;
  }
}

// Create and export a singleton instance
export const emailService = new EmailService(); 