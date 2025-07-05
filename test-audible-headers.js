const axios = require('axios');

async function testAudibleWithHeaders() {
  const query = 'harry potter';
  const searchUrl = `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}`;
  
  console.log('🧪 Testing Audible search with different headers...');
  console.log('🔍 Query:', query);
  console.log('🔍 URL:', searchUrl);
  console.log('');

  // Header Configuration 1: Minimal headers
  const minimalHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  // Header Configuration 2: Full browser headers
  const fullHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-CA,en;q=0.9,en-US;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
  };

  const configs = [
    { name: 'Minimal Headers', headers: minimalHeaders },
    { name: 'Full Browser Headers', headers: fullHeaders }
  ];

  for (const config of configs) {
    console.log(`📋 Testing: ${config.name}`);
    console.log('📋 Headers:', Object.keys(config.headers));
    
    try {
      console.log('🔍 Making request...');
      
      const startTime = Date.now();
      const response = await axios.get(searchUrl, {
        headers: config.headers,
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });
      const endTime = Date.now();
      
      console.log('✅ Response received!');
      console.log('📊 Status:', response.status);
      console.log('📊 Response Time:', `${endTime - startTime}ms`);
      console.log('📊 Content-Type:', response.headers['content-type']);
      console.log('📊 Content-Length:', response.headers['content-length']);
      console.log('📊 Server:', response.headers['server']);
      
      const html = response.data;
      console.log('📊 HTML Length:', html.length);
      
      // Check for different response types
      if (html.includes('No results') || html.includes('No results for')) {
        console.log('❌ Got "No results" page');
      } else if (html.includes('Access Denied') || html.includes('blocked')) {
        console.log('❌ Got blocked/access denied');
      } else if (html.includes('captcha') || html.includes('verify')) {
        console.log('❌ Got captcha/verification page');
      } else {
        console.log('✅ Got search results page');
        
        // Look for audiobook links
        const audiobookPattern = /<a[^>]*href="(\/pd\/[^"]*)"[^>]*>([^<]+)<\/a>/gi;
        const matches = [...html.matchAll(audiobookPattern)];
        
        console.log(`📚 Found ${matches.length} potential audiobook links`);
        
        if (matches.length > 0) {
          console.log('📚 First 3 matches:');
          matches.slice(0, 3).forEach((match, index) => {
            console.log(`  ${index + 1}. ${match[2].trim()}`);
          });
        }
      }
      
      // Show a preview of the response
      console.log('📄 HTML Preview (first 200 chars):');
      console.log(html.substring(0, 200).replace(/\n/g, ' '));
      
    } catch (error) {
      console.log('❌ Error occurred:');
      console.log('❌ Message:', error.message);
      
      if (error.response) {
        console.log('❌ Response Status:', error.response.status);
        console.log('❌ Response Headers:', error.response.headers);
      }
    }
    
    console.log('');
    console.log('─'.repeat(80));
    console.log('');
  }
  
  console.log('🏁 Test completed!');
}

testAudibleWithHeaders(); 