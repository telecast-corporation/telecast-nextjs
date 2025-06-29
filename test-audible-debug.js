const axios = require('axios');

async function testAudibleSearch() {
  const query = 'The Waitress';
  console.log('🔍 Testing Audible search for:', query);

  try {
    // Use the same headers as the updated search function
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

    const searchUrl = `https://www.audible.ca/search?keywords=${encodeURIComponent(query)}&ref=a_search_c1_header_0_1_1_1&pf_rd_p=1d79b443-2f1d-43a3-b1dc-31a2cd242566&pf_rd_r=1&pf_rd_s=center-1&pf_rd_t=101&pf_rd_i=audible-search&pf_rd_m=A2ZO8JX97D5MN9&pf_rd_q=1`;

    console.log('🔍 Search URL:', searchUrl);

    const response = await axios.get(searchUrl, {
      headers,
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', {
      'content-type': response.headers['content-type'],
      'content-length': response.headers['content-length'],
      'server': response.headers['server'],
    });

    const html = response.data;
    console.log('🔍 HTML length:', html.length);

    // Look for audiobook links
    const audiobookLinkPatterns = [
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*class="[^"]*bc-link[^"]*"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="(\/pd\/[^"]*)"[^>]*data-bc-link[^>]*>([^<]+)<\/a>/gi,
      /href="(\/pd\/[^"]*)"[^>]*>([^<]+)</gi,
    ];

    let matches = [];
    let usedPattern = 0;

    for (let i = 0; i < audiobookLinkPatterns.length; i++) {
      const pattern = audiobookLinkPatterns[i];
      const patternMatches = [...html.matchAll(pattern)];
      console.log(`🔍 Pattern ${i + 1} found ${patternMatches.length} matches`);
      
      if (patternMatches.length > 0) {
        matches = patternMatches;
        usedPattern = i + 1;
        console.log(`🔍 Using pattern ${usedPattern} with ${matches.length} audiobooks`);
        break;
      }
    }

    if (matches.length === 0) {
      console.log('🔍 No audiobooks found with any pattern');
      return;
    }

    console.log('\n🔍 Found audiobooks:');
    matches.slice(0, 10).forEach((match, index) => {
      const url = match[1];
      const title = match[2].trim();
      console.log(`  ${index + 1}. ${title}`);
      console.log(`     URL: ${url}`);
      console.log(`     Full URL: https://www.audible.ca${url}`);
      console.log('');
    });

    // Test the first audiobook URL
    if (matches.length > 0) {
      const firstMatch = matches[0];
      const testUrl = `https://www.audible.ca${firstMatch[1]}`;
      console.log(`🔍 Testing first audiobook URL: ${testUrl}`);
      
      try {
        const productResponse = await axios.get(testUrl, {
          headers,
          timeout: 15000,
          validateStatus: (status) => status < 500,
        });
        
        console.log(`🔍 Product page status: ${productResponse.status}`);
        console.log(`🔍 Product page length: ${productResponse.data.length}`);
        
        if (productResponse.status === 200) {
          console.log('✅ Product page is accessible');
        } else {
          console.log('❌ Product page returned error status');
        }
      } catch (error) {
        console.log('❌ Failed to access product page:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response headers:', error.response.headers);
    }
  }
}

testAudibleSearch(); 