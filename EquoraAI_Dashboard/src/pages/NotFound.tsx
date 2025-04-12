
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 tracking-tight">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Oops! We couldn't find this page.
        </p>
        
        <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
          The page at <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{location.pathname}</code> doesn't exist.
        </div>
        
        <Button asChild size="lg" className="animate-pulse-slow">
          <a href="/">Return to Dashboard</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
