import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { calendarService, CalendarEvent, EventType } from '@/services/calendarService';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';

const Calendar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDate = searchParams.get('date') 
    ? parseISO(searchParams.get('date') as string) 
    : new Date();
  
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<CalendarEvent[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
    'earnings', 'dividend', 'conference', 'economic', 'ipo', 'split'
  ]);
  const [selectedImportance, setSelectedImportance] = useState<('high' | 'medium' | 'low')[]>([
    'high', 'medium', 'low'
  ]);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  
  useEffect(() => {
    // Subscribe to calendar events
    const unsubscribe = calendarService.subscribe(allEvents => {
      setEvents(allEvents);
    });
    
    // Fetch initial data
    calendarService.fetchLatestEvents();
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);
  
  // Filter events based on selected types and importance
  useEffect(() => {
    const filteredEvents = events.filter(event => 
      selectedTypes.includes(event.type) &&
      selectedImportance.includes(event.importance)
    );
    
    setDisplayedEvents(filteredEvents);
  }, [events, selectedTypes, selectedImportance]);
  
  // Handle type filter change
  const handleTypeFilterChange = (type: EventType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  // Handle importance filter change
  const handleImportanceFilterChange = (importance: 'high' | 'medium' | 'low') => {
    if (selectedImportance.includes(importance)) {
      setSelectedImportance(selectedImportance.filter(i => i !== importance));
    } else {
      setSelectedImportance([...selectedImportance, importance]);
    }
  };
  
  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return displayedEvents.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };
  
  // Prev month button handler
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Next month button handler
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Generate calendar month view
  const renderCalendarMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return (
      <div>
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center py-2 font-medium text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const dayEvents = getEventsForDate(day);
            
            return (
              <div 
                key={day.toString()}
                className={cn(
                  "min-h-[100px] p-1 border rounded-md transition-colors",
                  isCurrentMonth ? "bg-card" : "bg-muted/40",
                  isSelected ? "border-primary" : "border-border",
                  "hover:border-primary/50 cursor-pointer"
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div className={cn(
                  "text-right px-1 font-medium text-sm",
                  !isCurrentMonth && "text-muted-foreground",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, 'd')}
                </div>
                
                <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                  {dayEvents.slice(0, 3).map(event => (
                    <div 
                      key={event.id}
                      className="text-xs p-1 truncate rounded bg-muted/50"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Get badge variant for event type
  const getEventBadgeVariant = (type: EventType): "default" | "secondary" | "destructive" | "outline" => {
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
  
  // Render events for selected date
  const renderSelectedDateEvents = () => {
    const selectedDateEvents = getEventsForDate(selectedDate);
    
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">{format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateEvents.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No events on this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <Badge variant={getEventBadgeVariant(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {event.time ? `${format(selectedDate, 'MMM d, yyyy')} at ${event.time}` : format(selectedDate, 'MMMM d, yyyy')}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm mb-2">{event.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    {event.symbol && (
                      <span className="font-medium">Symbol: {event.symbol}</span>
                    )}
                    
                    <div className="flex items-center gap-3">
                      {event.expectedMove && (
                        <span>Est. Move: {event.expectedMove > 0 ? '+' : ''}{event.expectedMove}%</span>
                      )}
                      
                      <span className={getImportanceColor(event.importance)}>
                        {event.importance} importance
                      </span>
                      
                      {!event.confirmed && (
                        <span className="text-muted-foreground">(unconfirmed)</span>
                      )}
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
  
  // Render agenda view
  const renderAgendaView = () => {
    // Group events by date
    const groupedEvents: Record<string, CalendarEvent[]> = {};
    
    displayedEvents.forEach(event => {
      if (!groupedEvents[event.date]) {
        groupedEvents[event.date] = [];
      }
      groupedEvents[event.date].push(event);
    });
    
    // Sort dates
    const sortedDates = Object.keys(groupedEvents).sort();
    
    return (
      <div className="space-y-6">
        {sortedDates.map(dateStr => {
          const date = parseISO(dateStr);
          const dateEvents = groupedEvents[dateStr];
          
          return (
            <div key={dateStr}>
              <h3 className="text-lg font-medium mb-3">{format(date, 'EEEE, MMMM d, yyyy')}</h3>
              <div className="space-y-3">
                {dateEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="p-3 border rounded-md hover:border-primary transition-colors"
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant={getEventBadgeVariant(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      {event.time && <span>{event.time}</span>}
                      {event.symbol && <span className="ml-3">Symbol: {event.symbol}</span>}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm mb-2">{event.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        {event.expectedMove && (
                          <span>Est. Move: {event.expectedMove > 0 ? '+' : ''}{event.expectedMove}%</span>
                        )}
                        
                        <span className={getImportanceColor(event.importance)}>
                          {event.importance} importance
                        </span>
                        
                        {!event.confirmed && (
                          <span className="text-muted-foreground">(unconfirmed)</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {sortedDates.length === 0 && (
          <div className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No events found with the current filters</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Earnings & Event Calendar</h1>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Event Type Filters */}
                <div>
                  <h3 className="font-medium mb-2">Event Types</h3>
                  <div className="space-y-2">
                    {(['earnings', 'dividend', 'conference', 'economic', 'ipo', 'split'] as EventType[]).map(type => (
                      <div key={type} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`type-${type}`}
                          className="h-4 w-4 mr-2"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeFilterChange(type)}
                        />
                        <label htmlFor={`type-${type}`} className="text-sm">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Importance Filters */}
                <div>
                  <h3 className="font-medium mb-2">Importance</h3>
                  <div className="space-y-2">
                    {(['high', 'medium', 'low'] as const).map(importance => (
                      <div key={importance} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`importance-${importance}`}
                          className="h-4 w-4 mr-2"
                          checked={selectedImportance.includes(importance)}
                          onChange={() => handleImportanceFilterChange(importance)}
                        />
                        <label 
                          htmlFor={`importance-${importance}`} 
                          className={`text-sm ${getImportanceColor(importance)}`}
                        >
                          {importance.charAt(0).toUpperCase() + importance.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Date Range Selector */}
                <div>
                  <h3 className="font-medium mb-2">Date Range</h3>
                  <Select defaultValue="upcoming">
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                      <SelectItem value="nextWeek">Next Week</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="nextMonth">Next Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Calendar and Events View */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle>
                  {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : 'Agenda View'}
                </CardTitle>
                
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevMonth}
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}
                    title="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-8" />
                  
                  <Tabs 
                    defaultValue="month" 
                    value={viewMode} 
                    onValueChange={(value) => setViewMode(value as 'month' | 'agenda')}
                  >
                    <TabsList>
                      <TabsTrigger value="month">Month</TabsTrigger>
                      <TabsTrigger value="agenda">Agenda</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              
              <CardContent>
                {viewMode === 'month' ? (
                  <>
                    {renderCalendarMonth()}
                    <div className="mt-6">
                      {renderSelectedDateEvents()}
                    </div>
                  </>
                ) : (
                  renderAgendaView()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar; 