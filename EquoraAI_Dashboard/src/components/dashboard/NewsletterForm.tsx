import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { CheckCheck, MailIcon, TrendingUp, PieChart, Newspaper, Sparkles } from 'lucide-react';
import { debugFetch } from '@/utils/apiDebug';

// Form validation schema
const formSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  name: z.string().optional(),
  frequency: z.literal('daily'),
  includeTopStocks: z.boolean().default(true),
  includeSectorAnalysis: z.boolean().default(true),
  includeNewsDigest: z.boolean().default(true),
  includePredictions: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const NewsletterForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Define form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      frequency: 'daily',
      includeTopStocks: true,
      includeSectorAnalysis: true,
      includeNewsDigest: true,
      includePredictions: false,
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      console.log('Submitting newsletter form with values:', values);
      
      // Convert switch values to topic strings
      const topics = [];
      if (values.includeTopStocks) topics.push('top-stocks');
      if (values.includeSectorAnalysis) topics.push('sector-analysis');
      if (values.includeNewsDigest) topics.push('news-digest');
      if (values.includePredictions) topics.push('ai-predictions');
      
      // Create request payload
      const payload = {
        email: values.email,
        name: values.name || '',
        frequency: 'daily',
        topics
      };
      
      // Use debug fetch to log everything
      await debugFetch('http://localhost:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Show success message and toast
      toast.success(`Subscribed! Check ${values.email} for welcome email`);
      setIsSuccess(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        form.reset();
      }, 5000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setErrorMessage('Failed to subscribe. Please try again or contact support.');
      toast.error('Failed to subscribe to newsletter');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-medium">Market Insights Newsletter</CardTitle>
        <CardDescription className="text-gray-100">
          Stay updated with our AI-powered market analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCheck className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="text-lg font-medium">Subscription Confirmed!</h3>
            <p className="text-muted-foreground mt-1">
              We've sent a welcome email to {form.getValues().email}.
              Check your inbox soon for market insights.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input 
                          placeholder="you@example.com" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your Name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium">Newsletter Content</h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="includeTopStocks"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Top Performing Stocks
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Receive updates on the best performing stocks
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeSectorAnalysis"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-1.5">
                            <PieChart className="h-4 w-4 text-primary" />
                            Sector Analysis
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Get insights on different market sectors
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeNewsDigest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-1.5">
                            <Newspaper className="h-4 w-4 text-primary" />
                            News Digest
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Important financial news and headlines
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includePredictions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-primary" />
                            AI Market Predictions
                          </FormLabel>
                          <FormDescription className="text-xs">
                            AI-powered forecasts and market predictions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {errorMessage && (
                <div className="text-sm font-medium text-red-500 mt-2">
                  {errorMessage}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe to Newsletter"}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-2">
                We respect your privacy. You can unsubscribe at any time.
              </p>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsletterForm;
