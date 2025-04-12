import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { debugFetch } from '@/utils/apiDebug';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  Mail, 
  Calendar, 
  Newspaper, 
  TrendingUp, 
  PieChart, 
  Sparkles 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Form validation schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  frequency: z.literal('daily'),
  includeSectorAnalysis: z.boolean().default(true),
  includeTopStocks: z.boolean().default(true),
  includeNewsDigest: z.boolean().default(true),
  includePredictions: z.boolean().default(false),
});

// Form values type
type FormValues = z.infer<typeof formSchema>;

interface NewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail?: string;
}

const NewsletterDialog: React.FC<NewsletterDialogProps> = ({ 
  open, 
  onOpenChange,
  initialEmail = ""
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { user } = useAuth();
  
  // Define form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      frequency: 'daily',
      includeSectorAnalysis: true,
      includeTopStocks: true,
      includeNewsDigest: true,
      includePredictions: false,
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting newsletter dialog with values:', values);
      
      // Convert switch values to topic strings
      const topics = [];
      if (values.includeSectorAnalysis) topics.push('sector-analysis');
      if (values.includeTopStocks) topics.push('top-stocks');
      if (values.includeNewsDigest) topics.push('news-digest');
      if (values.includePredictions) topics.push('ai-predictions');
      
      // Create request payload
      const payload = {
        email: values.email,
        name: user?.name || '',
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
      
      // Show success message
      toast.success(`Subscribed! Check ${values.email} for welcome email`);
      setIsSuccess(true);
      
      // Reset form after 5 seconds and close dialog
      setTimeout(() => {
        form.reset();
        setIsSuccess(false);
        onOpenChange(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to subscribe to newsletter:', error);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5 text-primary" />
            Subscribe to our Newsletter
          </DialogTitle>
          <DialogDescription>
            Stay updated with the latest financial insights and market trends tailored to your interests.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Successfully Subscribed!</h3>
              <p className="text-gray-500">
                Thank you for subscribing. We've sent you a welcome 
                newsletter to {form.getValues().email}. You'll receive 
                updates according to your selected frequency.
              </p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        {...field} 
                        autoComplete="email"
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
                          <FormDescription>
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
                          <FormDescription>
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
                          <FormDescription>
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
                          <FormDescription>
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
              
              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={cn(
                    "w-full", 
                    isSubmitting && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe to Newsletter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterDialog; 