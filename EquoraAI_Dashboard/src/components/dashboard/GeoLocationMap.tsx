import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MarketRegion {
  coordinates: [number, number];
  name: string;
  marketIndex: string;
  value: number;
  percentChange: number;
  sentiment: number;
  recentActivity: string;
  pulseRate: number;
}

interface GeoLocationMapProps {
  loading?: boolean;
  regions?: MarketRegion[];
}

const generateDefaultRegions = (): MarketRegion[] => {
  return [
    {
      coordinates: [-74.0060, 40.7128], // New York
      name: "New York",
      marketIndex: "NYSE",
      value: 36789.5,
      percentChange: 1.24,
      sentiment: 0.72,
      recentActivity: "High trading volume in tech sector",
      pulseRate: 2,
    },
    {
      coordinates: [-0.1278, 51.5074], // London
      name: "London",
      marketIndex: "FTSE",
      value: 7654.3,
      percentChange: -0.58,
      sentiment: -0.32,
      recentActivity: "Currency fluctuations affecting market",
      pulseRate: 3,
    },
    {
      coordinates: [139.6917, 35.6895], // Tokyo
      name: "Tokyo",
      marketIndex: "Nikkei",
      value: 28459.7,
      percentChange: 2.15,
      sentiment: 0.85,
      recentActivity: "Export stocks performing well",
      pulseRate: 1.5,
    },
    {
      coordinates: [121.4737, 31.2304], // Shanghai
      name: "Shanghai",
      marketIndex: "SSE",
      value: 3421.8,
      percentChange: -1.02,
      sentiment: -0.45,
      recentActivity: "New regulations impacting financials",
      pulseRate: 2.5,
    },
    {
      coordinates: [77.2090, 28.6139], // New Delhi
      name: "New Delhi",
      marketIndex: "SENSEX",
      value: 59345.2,
      percentChange: 0.87,
      sentiment: 0.56,
      recentActivity: "IT services showing strong growth",
      pulseRate: 1.8,
    },
    {
      coordinates: [151.2093, -33.8688], // Sydney
      name: "Sydney",
      marketIndex: "ASX",
      value: 7312.6,
      percentChange: 0.34,
      sentiment: 0.21,
      recentActivity: "Mining sector stabilizing after volatility",
      pulseRate: 2.2,
    },
    {
      coordinates: [18.4241, -33.9249], // Cape Town
      name: "Cape Town",
      marketIndex: "JSE",
      value: 68754.3,
      percentChange: -0.42,
      sentiment: -0.24,
      recentActivity: "Resource stocks under pressure",
      pulseRate: 3.5,
    },
    {
      coordinates: [-46.6333, -23.5505], // São Paulo
      name: "São Paulo",
      marketIndex: "BOVESPA",
      value: 115784.2,
      percentChange: 1.56,
      sentiment: 0.68,
      recentActivity: "Agricultural commodities driving gains",
      pulseRate: 1.3,
    },
  ];
};

// Helper function to get a color based on sentiment value
const getSentimentColor = (sentiment: number, alpha: number = 1) => {
  if (sentiment > 0.5) return `rgba(34, 197, 94, ${alpha})`;  // green
  if (sentiment > 0) return `rgba(74, 222, 128, ${alpha})`;   // light green
  if (sentiment > -0.5) return `rgba(248, 113, 113, ${alpha})`; // light red
  return `rgba(239, 68, 68, ${alpha})`;  // red
};

const GeoLocationMap: React.FC<GeoLocationMapProps> = ({ 
  loading = false,
  regions = generateDefaultRegions()
}) => {
  const [mapReady, setMapReady] = useState(false);
  
  // Calculate average sentiment for the animation color
  const averageSentiment = regions.reduce((acc, region) => acc + region.sentiment, 0) / regions.length;
  
  useEffect(() => {
    // This ensures the map renders correctly when the component mounts
    setMapReady(true);
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-[400px] shadow-md overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full h-[400px] shadow-md overflow-hidden relative z-10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span>Global Market Pulse</span>
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            averageSentiment > 0 ? "bg-green-500" : "bg-red-500"
          )} />
        </CardTitle>
        <CardDescription>
          Real-time market sentiment across major global trading centers
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="w-full h-[336px]">
          {mapReady && (
            <MapContainer 
              center={[20, 0]} 
              zoom={2} 
              style={{ height: '100%', width: '100%', background: '#242730', zIndex: 10 }}
              zoomControl={false}
              attributionControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {regions.map((region, index) => (
                <CircleMarker 
                  key={index}
                  center={[region.coordinates[1], region.coordinates[0]]}
                  pathOptions={{ 
                    fillColor: getSentimentColor(region.sentiment, 0.8),
                    fillOpacity: 0.8,
                    weight: 2,
                    color: 'white',
                    opacity: 0.7,
                  }}
                  radius={10 + Math.abs(region.sentiment) * 10}
                >
                  <Tooltip permanent={false} direction="top">
                    <div className="p-2">
                      <div className="font-bold text-base">{region.name}</div>
                      <div className="text-sm">{region.marketIndex}</div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm">Value: {region.value.toLocaleString()}</div>
                        <div className={`text-sm font-semibold ${region.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {region.percentChange >= 0 ? '+' : ''}{region.percentChange}%
                        </div>
                      </div>
                      <div className="mt-1 text-xs opacity-80">{region.recentActivity}</div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Circle size and color represent market sentiment strength. Hover over markers for details.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeoLocationMap;
