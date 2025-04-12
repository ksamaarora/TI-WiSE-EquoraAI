import { toast } from "sonner";
import { apiClient } from './apiClient';
import { emailService } from './emailService';
import { newsletterContentService } from './newsletterContentService';

export interface NewsletterPreferences {
  email: string;
  frequency: 'daily';
  includeSectorAnalysis?: boolean;
  includeTopStocks?: boolean;
  includeNewsDigest?: boolean;
  includePredictions?: boolean;
}

export interface NewsletterSubscription {
  id: string;
  createdAt: string;
  preferences: NewsletterPreferences;
  isActive: boolean;
  lastSent?: string;
  nextScheduledSend?: string;
}

class NewsletterService {
  private subscriptions: NewsletterSubscription[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor() {
    // In a real app, we would load subscriptions from localStorage or an API
    this.loadSubscriptions();
    
    // Start the scheduler to check for newsletters to send
    this.startScheduler();
  }
  
  private loadSubscriptions() {
    try {
      const saved = localStorage.getItem('newsletter_subscriptions');
      if (saved) {
        this.subscriptions = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load newsletter subscriptions:", error);
    }
  }
  
  private saveSubscriptions() {
    try {
      localStorage.setItem('newsletter_subscriptions', JSON.stringify(this.subscriptions));
    } catch (error) {
      console.error("Failed to save newsletter subscriptions:", error);
    }
  }
  
  /**
   * Subscribe a user to the newsletter
   * @param preferences User's newsletter preferences
   * @returns Promise resolving to success message or error
   */
  async subscribe(preferences: NewsletterPreferences): Promise<{ success: boolean; message: string }> {
    try {
      // In a real application, this would be an API call
      // For demo purposes, we're simulating a successful API call
      
      // Uncomment this when API is ready:
      // const response = await apiClient.post('/api/newsletter/subscribe', preferences);
      // return response.data;
      
      // Check if email already exists
      const existingIndex = this.subscriptions.findIndex(
        sub => sub.preferences.email === preferences.email
      );
      
      const now = new Date();
      
      if (existingIndex >= 0) {
        // Update existing subscription
        this.subscriptions[existingIndex] = {
          ...this.subscriptions[existingIndex],
          preferences,
          isActive: true,
          nextScheduledSend: this.calculateNextSendDate(preferences.frequency, now)
        };
      } else {
        // Create new subscription
        const newSubscription: NewsletterSubscription = {
          id: `sub_${Date.now()}`,
          createdAt: now.toISOString(),
          preferences,
          isActive: true,
          nextScheduledSend: this.calculateNextSendDate(preferences.frequency, now)
        };
        
        this.subscriptions.push(newSubscription);
      }
      
      // Save subscriptions
      this.saveSubscriptions();
      
      // Send an immediate welcome newsletter
      this.sendWelcomeNewsletter(preferences);
      
      return {
        success: true,
        message: 'Successfully subscribed to newsletter'
      };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      throw new Error('Failed to subscribe to newsletter');
    }
  }
  
  /**
   * Unsubscribe a user from the newsletter
   * @param email User's email address
   * @returns Promise resolving to success message or error
   */
  async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // In a real application, this would be an API call
      // For demo purposes, we're simulating a successful API call
      
      // Uncomment this when API is ready:
      // const response = await apiClient.post('/api/newsletter/unsubscribe', { email });
      // return response.data;
      
      // Find the subscription
      const subscriptionIndex = this.subscriptions.findIndex(
        sub => sub.preferences.email === email
      );
      
      if (subscriptionIndex >= 0) {
        // Mark as inactive rather than removing
        this.subscriptions[subscriptionIndex].isActive = false;
        this.saveSubscriptions();
      }
      
      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      };
    } catch (error) {
      console.error('Newsletter unsubscription error:', error);
      throw new Error('Failed to unsubscribe from newsletter');
    }
  }
  
  async getSubscription(email: string): Promise<NewsletterSubscription | null> {
    // In a real app, this would be an API call
    const subscription = this.subscriptions.find(
      sub => sub.preferences.email === email && sub.isActive
    );
    
    return subscription || null;
  }
  
  /**
   * Start the scheduler to check for newsletters to send
   */
  private startScheduler() {
    // In a real application, you would use a proper scheduling system
    // For demo purposes, we'll use setInterval to check every minute
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Check every minute (in a real app, this would be much less frequent)
    this.intervalId = setInterval(() => {
      this.checkAndSendNewsletters();
    }, 60000); // 60 seconds
    
    // Also check immediately on startup
    this.checkAndSendNewsletters();
  }
  
  /**
   * Calculate the next send date based on frequency
   */
  private calculateNextSendDate(frequency: 'daily', fromDate: Date): string {
    const nextDate = new Date(fromDate);
    
    // Since all subscriptions are daily, add 1 day
    nextDate.setDate(nextDate.getDate() + 1);
    
    return nextDate.toISOString();
  }
  
  /**
   * Check for newsletters that need to be sent
   */
  private checkAndSendNewsletters() {
    const now = new Date();
    
    // Find subscriptions that are due to be sent
    const dueSubscriptions = this.subscriptions.filter(sub => {
      if (!sub.isActive || !sub.nextScheduledSend) return false;
      
      const nextSendDate = new Date(sub.nextScheduledSend);
      return nextSendDate <= now;
    });
    
    // Send newsletters to due subscriptions
    dueSubscriptions.forEach(subscription => {
      this.sendNewsletter(subscription);
    });
  }
  
  /**
   * Send a newsletter to a subscriber
   */
  private async sendNewsletter(subscription: NewsletterSubscription) {
    try {
      const { preferences } = subscription;
      
      // Generate newsletter content
      const newsletterData = newsletterContentService.generateNewsletterContent(preferences);
      
      // Send the email
      const success = await emailService.sendNewsletterEmail({
        email: preferences.email,
        ...newsletterData
      });
      
      if (success) {
        // Update subscription with last sent date and calculate next send date
        const now = new Date();
        subscription.lastSent = now.toISOString();
        subscription.nextScheduledSend = this.calculateNextSendDate(preferences.frequency, now);
        this.saveSubscriptions();
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
    }
  }
  
  /**
   * Send a welcome newsletter to a new subscriber
   */
  private async sendWelcomeNewsletter(preferences: NewsletterPreferences) {
    try {
      // Generate newsletter content
      const newsletterData = newsletterContentService.generateNewsletterContent(preferences);
      
      // Create a special welcome subject
      const welcomeSubject = `Welcome to EquoraAI Newsletter - Your First Market Update`;
      
      // Send the email
      await emailService.sendNewsletterEmail({
        email: preferences.email,
        subject: welcomeSubject,
        content: {
          ...newsletterData.content,
          greeting: `Welcome to the EquoraAI Newsletter! We're excited to have you on board. Here's your first market update with all the insights you need.`
        }
      });
    } catch (error) {
      console.error('Failed to send welcome newsletter:', error);
    }
  }
}

// Create and export a singleton instance
export const newsletterService = new NewsletterService();
