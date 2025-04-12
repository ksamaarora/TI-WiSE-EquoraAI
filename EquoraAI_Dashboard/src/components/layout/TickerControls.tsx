import React from 'react';
import { Pause, Play, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TickerControlsProps {
  isPaused: boolean;
  speed: 'slow' | 'normal' | 'fast';
  onPlayPauseToggle: () => void;
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

const TickerControls: React.FC<TickerControlsProps> = ({
  isPaused,
  speed,
  onPlayPauseToggle,
  onSpeedChange
}) => {
  return (
    <div className="absolute right-0 top-0 h-full flex items-center z-10">
      <div className="flex items-center bg-background/50 dark:bg-background/80 backdrop-blur-sm px-2 py-1 rounded-l-md border-l border-y border-border">
        <button
          onClick={onPlayPauseToggle}
          className="p-1 rounded-full hover:bg-background/80 dark:hover:bg-background/50 text-foreground/70"
          aria-label={isPaused ? "Play ticker" : "Pause ticker"}
        >
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
        </button>
        
        <div className="h-3.5 mx-2 border-l border-border/50"></div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSpeedChange('slow')}
            className={cn(
              "text-xs p-1 rounded",
              speed === 'slow' ? "bg-primary/10 text-primary" : "text-foreground/60 hover:text-foreground"
            )}
            aria-label="Slow speed"
          >
            <ChevronRight size={10} />
          </button>
          
          <button
            onClick={() => onSpeedChange('normal')}
            className={cn(
              "text-xs p-1 rounded flex",
              speed === 'normal' ? "bg-primary/10 text-primary" : "text-foreground/60 hover:text-foreground"
            )}
            aria-label="Normal speed"
          >
            <ChevronRight size={10} />
            <ChevronRight size={10} className="-ml-1.5" />
          </button>
          
          <button
            onClick={() => onSpeedChange('fast')}
            className={cn(
              "text-xs p-1 rounded flex",
              speed === 'fast' ? "bg-primary/10 text-primary" : "text-foreground/60 hover:text-foreground"
            )}
            aria-label="Fast speed"
          >
            <ChevronRight size={10} />
            <ChevronRight size={10} className="-ml-1.5" />
            <ChevronRight size={10} className="-ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TickerControls; 