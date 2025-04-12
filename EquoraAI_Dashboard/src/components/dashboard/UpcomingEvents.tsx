import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, ArrowRight, ArrowUpRight, Calendar, DollarSign, BarChart, PieChart, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calendarService, CalendarEvent, EventType } from '@/services/calendarService';
import { formatDate } from '@/utils/formatters';

// Props for the component
interface UpcomingEventsProps {
  loading?: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ loading = false }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Subscribe to calendar events
    const unsubscribe = calendarService.subscribe(allEvents => {
      // Get next 5 upcoming important events
      const upcomingEvents = allEvents
        .filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      
      setEvents(upcomingEvents);
    });
    
    // Fetch initial data
    calendarService.fetchLatestEvents();
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);
  
  // Get icon for event type
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'earnings':
        return <BarChart className="h-4 w-4" />;
      case 'dividend':
        return <DollarSign className="h-4 w-4" />;
      case 'conference':
        return <CalendarClock className="h-4 w-4" />;
      case 'economic':
        return <PieChart className="h-4 w-4" />;
      case 'ipo':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'split':
        return <Calendar className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };
  
  // Get badge variant for event type
  const getEventBadgeVariant = (type: EventType): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'earnings':
        return 'default';
      case 'dividend':
        return 'secondary';
      case 'conference':
        return 'outline';
      case 'economic':
        return 'destructive';
      case 'ipo':
        return 'default';
      case 'split':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Get color for importance
  const getImportanceColor = (importance: 'high' | 'medium' | 'low'): string => {
    switch (importance) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-blue-500';
      default:
        return '';
    }
  };
  
  // Format event date display
  const formatEventDate = (dateStr: string, timeStr?: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    let dateDisplay = '';
    if (isToday) {
      dateDisplay = 'Today';
    } else if (isTomorrow) {
      dateDisplay = 'Tomorrow';
    } else {
      dateDisplay = formatDate(dateStr);
    }
    
    return timeStr ? `${dateDisplay}, ${timeStr}` : dateDisplay;
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse"
              >
                <div className="w-full h-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5" />
            Upcoming Events
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm"
            onClick={() => navigate('/calendar')}
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No upcoming events found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div 
                key={event.id} 
                className="flex items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => navigate(`/calendar?date=${event.date}`)}
              >
                <div className="mr-3 mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm flex-1">{event.title}</h4>
                    <Badge variant={getEventBadgeVariant(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatEventDate(event.date, event.time)}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {event.expectedMove && (
                        <span className="text-xs font-medium">
                          Est. Move: {event.expectedMove > 0 ? '+' : ''}{event.expectedMove}%
                        </span>
                      )}
                      
                      {!event.confirmed && (
                        <span className="flex items-center text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unconfirmed
                        </span>
                      )}
                      
                      <span className={`text-xs font-medium ${getImportanceColor(event.importance)}`}>
                        {event.importance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents; 