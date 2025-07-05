const axios = require('axios');

async function testAudibleDetailed() {
  console.log('🔍 Detailed Audible Search Analysis');
  console.log('=====================================');
  
  const queries = [
    'harry potter',
    'atomic habits',
    'mel robbins'
  ];

  for (const query of queries) {
    console.log(`\n📚 Testing query: "${query}"`);
    console.log('─'.repeat(50));
    
    // Test 1: Simple URL
    await testQuery(query, `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}`, 'Simple URL');
    
    // Test 2: URL with basic parameters
    await testQuery(query, `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}&ref=a_search_c1_header_0_1_1_1`, 'With ref parameter');
    
    // Test 3: URL with marketplace
    await testQuery(query, `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}&pf_rd_m=A2ZO8JX97D5MN9`, 'With marketplace');
    
    // Test 4: Full original URL
    await testQuery(query, `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}&ref=a_search_c1_header_0_1_1_1&pf_rd_p=1d79b443-2f1d-43a3-b1dc-31a2cd242566&pf_rd_r=1&pf_rd_s=center-1&pf_rd_t=101&pf_rd_i=audible-search&pf_rd_m=A2ZO8JX97D5MN9&pf_rd_q=1`, 'Full original URL');
  }
}

async function testQuery(query, url, description) {
  const headers = {
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

  try {
    console.log(`\n🔍 ${description}`);
    console.log(`🔗 URL: ${url}`);
    
    const startTime = Date.now();
    const response = await axios.get(url, {
      headers,
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });
    const endTime = Date.now();
    
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    console.log(`📊 Status: ${response.status}`);
    
    const html = response.data;
    
    // Check for specific content patterns
    const checks = {
      'No results': html.includes('No results') || html.includes('No results for'),
      'Access denied': html.includes('Access Denied') || html.includes('blocked'),
      'Captcha': html.includes('captcha') || html.includes('verify'),
      'Search results': html.includes('search results') || html.includes('Results for'),
      'Audiobook links': html.includes('/pd/'),
      'Most popular': html.includes('Most popular listens'),
      'Harry Potter': html.includes('Harry Potter'),
      'Atomic Habits': html.includes('Atomic Habits'),
      'Mel Robbins': html.includes('Mel Robbins'),
    };
    
    console.log('📋 Content Analysis:');
    Object.entries(checks).forEach(([key, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${key}`);
    });
    
    // Count audiobook links
    const audiobookPattern = /<a[^>]*href="(\/pd\/[^"]*)"[^>]*>([^<]+)<\/a>/gi;
    const matches = [...html.matchAll(audiobookPattern)];
    console.log(`📚 Audiobook links found: ${matches.length}`);
    
    if (matches.length > 0) {
      console.log('📚 First 3 audiobooks:');
      matches.slice(0, 3).forEach((match, index) => {
        console.log(`  ${index + 1}. ${match[2].trim()}`);
      });
    }
    
    // Check if we got the "Most popular listens" section
    if (html.includes('Most popular listens')) {
      console.log('🎯 Found "Most popular listens" section - this suggests we got the right page but no search results');
    }
    
    // Show title of the page
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      console.log(`📄 Page title: ${titleMatch[1]}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
    }
  }
}

// Also test the homepage to see if we can access Audible at all
async function testHomepage() {
  console.log('\n🏠 Testing Audible Homepage Access');
  console.log('─'.repeat(50));
  
  const headers = {
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

  try {
    console.log('🔍 Testing homepage: https://www.audible.ca/');
    
    const response = await axios.get('https://www.audible.ca/', {
      headers,
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Content-Length: ${response.data.length}`);
    
    const html = response.data;
    
    // Check for homepage content
    const checks = {
      'Audible logo': html.includes('audible') || html.includes('Audible'),
      'Browse': html.includes('Browse'),
      'Audiobooks': html.includes('Audiobooks'),
      'Search': html.includes('search'),
    };
    
    console.log('📋 Homepage Analysis:');
    Object.entries(checks).forEach(([key, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${key}`);
    });
    
    // Show title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      console.log(`📄 Page title: ${titleMatch[1]}`);
    }
    
  } catch (error) {
    console.log(`❌ Homepage error: ${error.message}`);
  }
}

async function runAllTests() {
  await testHomepage();
  await testAudibleDetailed();
  console.log('\n🏁 All tests completed!');
}

runAllTests(); 