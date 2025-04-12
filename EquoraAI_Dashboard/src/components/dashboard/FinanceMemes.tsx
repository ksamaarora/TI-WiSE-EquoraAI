import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ThumbsUp, MessageSquare, Share } from 'lucide-react';

// Console log for debugging
console.log("FinanceMemes component is being loaded");

// Mock data for finance memes
const memesData = [
  {
    id: 1,
    imageUrl: '/memes/month-end-close.jpg',
    caption: 'When you finally finish month-end close',
    likes: 2458,
    comments: 183,
    shares: 76
  },
  {
    id: 2,
    imageUrl: '/memes/risky-investment-dad.jpg',
    caption: 'My dad after I do a risky investment',
    likes: 1872,
    comments: 156,
    shares: 94
  },
  {
    id: 3,
    imageUrl: '/memes/market-crash-divorce.jpg',
    caption: 'A stock market crash is worse than divorce - you lose half your money and your wife is still around',
    likes: 3156,
    comments: 247,
    shares: 118
  },
  {
    id: 4,
    imageUrl: '/memes/interstellar-hdfc.jpg',
    caption: '1 hour here is 7 years on earth. Great let\'s wait here for HDFC to move',
    likes: 2785,
    comments: 204,
    shares: 87
  },
  {
    id: 5,
    imageUrl: '/memes/52-week-low.jpg',
    caption: 'Bought stocks at 52 weeks low. They are now at 104 week low',
    likes: 4210,
    comments: 310,
    shares: 156
  }
];

const FinanceMemes: React.FC = () => {
  console.log("FinanceMemes is rendering");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance the carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setTimeout(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % memesData.length);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [currentIndex, isAutoPlaying]);

  // Handle manual navigation
  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + memesData.length) % memesData.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % memesData.length);
  };

  // Format numbers with k, m suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    })
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="animate-pulse text-3xl">🔥</span> 
          Top Finance Memes
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={handlePrevious} 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-200/20 dark:hover:bg-gray-800/30"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            onClick={handleNext} 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-200/20 dark:hover:bg-gray-800/30"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden h-[420px] md:h-[500px] rounded-lg shadow-xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute w-full h-full"
          >
            <Card className="relative h-full overflow-hidden rounded-xl border-0 shadow-lg bg-gray-900/95">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
              <div className="absolute inset-0 bg-gray-900/80 z-5"></div>
              <img
                src={memesData[currentIndex].imageUrl}
                alt={memesData[currentIndex].caption}
                className="w-full h-full object-contain px-2 py-2 z-6 relative"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loops
                  target.src = '/placeholder.svg';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20 bg-gradient-to-t from-black/95 to-transparent pt-10">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-2xl font-bold mb-4 text-shadow"
                >
                  {memesData[currentIndex].caption}
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5" />
                    <span>{formatNumber(memesData[currentIndex].likes)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>{formatNumber(memesData[currentIndex].comments)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share className="h-5 w-5" />
                    <span>{formatNumber(memesData[currentIndex].shares)}</span>
                  </div>
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 8,
                    ease: "linear",
                    repeat: isAutoPlaying ? 0 : 0
                  }}
                  className="h-full bg-primary"
                />
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        {memesData.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex 
                ? "w-8 bg-primary" 
                : "w-2 bg-gray-300 dark:bg-gray-600"
            }`}
            aria-label={`Go to meme ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FinanceMemes; 