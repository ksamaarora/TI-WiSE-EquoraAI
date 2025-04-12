/**
 * Helper to test if API is accessible
 * Run this from the browser console:
 * import { testApiConnection } from './utils/testApi';
 * testApiConnection();
 */

export const testApiConnection = async () => {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test basic API connection
    const statusResponse = await fetch('http://localhost:5000/api/status');
    const statusData = await statusResponse.json();
    
    console.log('✅ API status check:', statusData);
    
    // Test newsletter subscription with a test email
    const testEmail = `test.${Date.now()}@example.com`;
    
    const newsletterResponse = await fetch('http://localhost:5000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        name: 'API Test',
        frequency: 'daily',
        topics: ['test-topic']
      }),
    });
    
    const newsletterData = await newsletterResponse.json();
    console.log(`✅ Newsletter subscription test (${testEmail}):`, newsletterData);
    
    return true;
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return false;
  }
}; 