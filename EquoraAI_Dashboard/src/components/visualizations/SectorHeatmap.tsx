import React, { useState } from 'react';
import { useStockVisualization } from '@/services/visualizationService';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Type definitions
type TimeRange = 'oneDay' | 'oneWeek' | 'oneMonth' | 'threeMonth' | 'sixMonth' | 'ytd' | 'oneYear';

const SectorHeatmap: React.FC = () => {
  const { sectorPerformance } = useStockVisualization();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('oneMonth');
  
  // Time range labels for display
  const timeRangeLabels: Record<TimeRange, string> = {
    oneDay: '1 Day',
    oneWeek: '1 Week',
    oneMonth: '1 Month',
    threeMonth: '3 Months',
    sixMonth: '6 Months',
    ytd: 'YTD',
    oneYear: '1 Year'
  };
  
  // Get color intensity based on performance value
  const getColorClass = (value: number) => {
    // Positive performance (green shades)
    if (value > 10) return 'bg-green-700 text-white';
    if (value > 7) return 'bg-green-600 text-white';
    if (value > 5) return 'bg-green-500 text-white';
    if (value > 3) return 'bg-green-400 text-white';
    if (value > 1) return 'bg-green-300 text-black';
    if (value > 0.2) return 'bg-green-200 text-black';
    
    // Negative performance (red shades)
    if (value < -10) return 'bg-red-700 text-white';
    if (value < -7) return 'bg-red-600 text-white';
    if (value < -5) return 'bg-red-500 text-white';
    if (value < -3) return 'bg-red-400 text-white';
    if (value < -1) return 'bg-red-300 text-black';
    if (value < -0.2) return 'bg-red-200 text-black';
    
    // Neutral (around zero)
    return 'bg-gray-200 text-black';
  };
  
  // Sort sectors by performance
  const sortedSectors = [...sectorPerformance].sort((a, b) => 
    b[selectedTimeRange] - a[selectedTimeRange]
  );
  
  // Get the max absolute value for scaling
  const maxAbsValue = Math.max(
    ...sectorPerformance.map(s => Math.abs(s[selectedTimeRange]))
  );
  
  return (
    <Card>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sector Performance Heatmap</h3>
        <Select
          value={selectedTimeRange}
          onValueChange={(value) => setSelectedTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(timeRangeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CardContent className="p-0">
        <div className="p-4">
          {/* Performance Legend */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1 text-xs overflow-x-auto">
              <div className="flex flex-col items-center">
                <span>Bearish</span>
                <div className="flex mt-1">
                  <div className="w-8 h-5 bg-red-700"></div>
                  <div className="w-8 h-5 bg-red-600"></div>
                  <div className="w-8 h-5 bg-red-500"></div>
                  <div className="w-8 h-5 bg-red-400"></div>
                  <div className="w-8 h-5 bg-red-300"></div>
                  <div className="w-8 h-5 bg-red-200"></div>
                </div>
                <div className="flex justify-between w-full mt-1">
                  <span>{(-maxAbsValue).toFixed(1)}%</span>
                  <span>0%</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center ml-2">
                <span>Bullish</span>
                <div className="flex mt-1">
                  <div className="w-8 h-5 bg-green-200"></div>
                  <div className="w-8 h-5 bg-green-300"></div>
                  <div className="w-8 h-5 bg-green-400"></div>
                  <div className="w-8 h-5 bg-green-500"></div>
                  <div className="w-8 h-5 bg-green-600"></div>
                  <div className="w-8 h-5 bg-green-700"></div>
                </div>
                <div className="flex justify-between w-full mt-1">
                  <span>0%</span>
                  <span>+{maxAbsValue.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Grid view of sector performance */}
          <div className="space-y-0.5">
            <div className="grid grid-cols-8 gap-0.5 mb-2 text-xs font-medium">
              <div className="col-span-2">Sector</div>
              <div className="text-center">1D</div>
              <div className="text-center">1W</div>
              <div className="text-center">1M</div>
              <div className="text-center">3M</div>
              <div className="text-center">6M</div>
              <div className="text-center">1Y</div>
            </div>
            
            {sortedSectors.map(sector => (
              <div key={sector.sector} className="grid grid-cols-8 gap-0.5 text-sm">
                <div className="col-span-2 py-2 font-medium">{sector.sector}</div>
                <div className={cn("text-center py-2", getColorClass(sector.oneDay))}>
                  {sector.oneDay > 0 ? '+' : ''}{sector.oneDay.toFixed(1)}%
                </div>
                <div className={cn("text-center py-2", getColorClass(sector.oneWeek))}>
                  {sector.oneWeek > 0 ? '+' : ''}{sector.oneWeek.toFixed(1)}%
                </div>
                <div className={cn("text-center py-2", getColorClass(sector.oneMonth))}>
                  {sector.oneMonth > 0 ? '+' : ''}{sector.oneMonth.toFixed(1)}%
                </div>
                <div className={cn("text-center py-2", getColorClass(sector.threeMonth))}>
                  {sector.threeMonth > 0 ? '+' : ''}{sector.threeMonth.toFixed(1)}%
                </div>
                <div className={cn("text-center py-2", getColorClass(sector.sixMonth))}>
                  {sector.sixMonth > 0 ? '+' : ''}{sector.sixMonth.toFixed(1)}%
                </div>
                <div className={cn("text-center py-2", getColorClass(sector.oneYear))}>
                  {sector.oneYear > 0 ? '+' : ''}{sector.oneYear.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          
          {/* Alternative visualization: horizontal bar chart */}
          <div className="mt-8">
            <h4 className="text-base font-medium mb-3">
              {timeRangeLabels[selectedTimeRange]} Performance
            </h4>
            
            <div className="space-y-2">
              {sortedSectors.map(sector => {
                const value = sector[selectedTimeRange];
                const isPositive = value >= 0;
                const width = `${Math.min(Math.abs(value) / maxAbsValue * 50, 50)}%`;
                
                return (
                  <div key={sector.sector} className="flex items-center">
                    <div className="w-1/4 text-sm font-medium">{sector.sector}</div>
                    
                    <div className="w-1/2 flex items-center h-8">
                      {/* Negative bar (left side) */}
                      {!isPositive && (
                        <>
                          <div className="flex-grow flex justify-end">
                            <div 
                              className="bg-red-500 h-5 rounded-l-sm"
                              style={{ width }}
                            ></div>
                          </div>
                          <div className="w-0.5 h-7 bg-gray-300"></div>
                          <div className="flex-grow"></div>
                        </>
                      )}
                      
                      {/* Positive bar (right side) */}
                      {isPositive && (
                        <>
                          <div className="flex-grow"></div>
                          <div className="w-0.5 h-7 bg-gray-300"></div>
                          <div className="flex-grow">
                            <div 
                              className="bg-green-500 h-5 rounded-r-sm"
                              style={{ width }}
                            ></div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className={cn(
                      "w-1/4 text-right text-sm font-medium",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {isPositive ? '+' : ''}{value.toFixed(2)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorHeatmap; 