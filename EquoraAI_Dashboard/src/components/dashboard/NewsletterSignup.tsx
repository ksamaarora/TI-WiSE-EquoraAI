import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCheck, MailIcon } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  name: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    required_error: "Please select a frequency",
  }),
  topics: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NewsletterSignup: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Define form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      frequency: 'weekly',
      topics: ['market-sentiment', 'technical-analysis'],
      sources: ['equora-ai'],
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
          form.reset();
        }, 5000);
      } else {
        setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const topicOptions = [
    { id: 'market-sentiment', label: 'Market Sentiment' },
    { id: 'technical-analysis', label: 'Technical Analysis' },
    { id: 'stock-performance', label: 'Stock Performance' },
    { id: 'market-news', label: 'Market News' },
    { id: 'predictions', label: 'AI Predictions' },
  ];
  
  return (
    <Card className="w-full max-w-md mx-auto mt-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-medium">Market Insights Newsletter</CardTitle>
        <CardDescription className="text-gray-100">
          Stay updated with our AI-powered market analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCheck className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="text-lg font-medium">Successfully Subscribed!</h3>
            <p className="text-muted-foreground mt-1">
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
              
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Frequency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often you'd like to receive our newsletter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="topics"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Topics of Interest</FormLabel>
                      <FormDescription>
                        Select topics you'd like to receive updates about
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      {topicOptions.map((topic) => (
                        <FormField
                          key={topic.id}
                          control={form.control}
                          name="topics"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={topic.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(topic.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedTopics = checked
                                        ? [...(field.value || []), topic.id]
                                        : field.value?.filter((value) => value !== topic.id) || [];
                                      field.onChange(updatedTopics);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {topic.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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

export default NewsletterSignup; 