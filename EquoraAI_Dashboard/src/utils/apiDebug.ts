/**
 * Debugger utility for API requests
 */

// Log API requests to console
export const logApiRequest = (endpoint: string, method: string, data: any) => {
  console.log(`🚀 API Request: ${method} ${endpoint}`);
  console.log('📦 Request Data:', data);
  
  return data; // Return data for chaining
};

// Log API responses to console
export const logApiResponse = (endpoint: string, response: Response, data: any) => {
  console.log(`✅ API Response: ${response.status} from ${endpoint}`);
  console.log('📦 Response Data:', data);
  
  return data; // Return data for chaining
};

// Log API errors to console
export const logApiError = (endpoint: string, error: any) => {
  console.error(`❌ API Error: ${endpoint}`);
  console.error('💥 Error Details:', error);
  
  throw error; // Rethrow for handling
};

// Helper to handle fetch with logging
export const debugFetch = async (url: string, options: RequestInit) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : undefined;
  
  try {
    logApiRequest(url, method, body);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      logApiError(url, { status: response.status, statusText: response.statusText, data });
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return logApiResponse(url, response, data);
  } catch (error) {
    logApiError(url, error);
    throw error;
  }
}; 