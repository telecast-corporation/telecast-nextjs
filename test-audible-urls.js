const axios = require('axios');

async function testAudibleUrls() {
  console.log('🔍 Testing Audible URL Cleaning and Accessibility');
  console.log('================================================');
  
  // Sample URLs from your logs
  const testUrls = [
    {
      original: '/pd/The-Let-Them-Theory-Audiobook/B0DFMX1RT8?ref_pageloadid=not_applicable&pf_rd_p=2d83d873-afed-4f6e-9945-fdb646a6bde3&pf_rd_r=KPY5HS36H7BGR75H8PAS&plink=J5KgXvTQuj4Uduc9&pageLoadId=P1eLBDkDiWCn07Mb&creativeId=4e78fa8e-9179-4516-a90a-451dc376cb89&ref=a_hp_c3_adblp13nmpxx_1',
      title: 'The Let Them Theory'
    },
    {
      original: '/pd/Atmosphere-A-GMA-Book-Club-Pick-Audiobook/B0DKZXH1J8?ref_pageloadid=not_applicable&pf_rd_p=2d83d873-afed-4f6e-9945-fdb646a6bde3&pf_rd_r=KPY5HS36H7BGR75H8PAS&plink=J5KgXvTQuj4Uduc9&pageLoadId=P1eLBDkDiWCn07Mb&creativeId=4e78fa8e-9179-4516-a90a-451dc376cb89&ref=a_hp_c3_adblp13nmpxx_2',
      title: 'Atmosphere: A GMA Book Club Pick'
    },
    {
      original: '/pd/Great-Big-Beautiful-Life-Audiobook/B0DGHNSTR6?ref_pageloadid=not_applicable&pf_rd_p=2d83d873-afed-4f6e-9945-fdb646a6bde3&pf_rd_r=KPY5HS36H7BGR75H8PAS&plink=J5KgXvTQuj4Uduc9&pageLoadId=P1eLBDkDiWCn07Mb&creativeId=4e78fa8e-9179-4516-a90a-451dc376cb89&ref=a_hp_c3_adblp13nmpxx_3',
      title: 'Great Big Beautiful Life'
    }
  ];

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

  for (const testCase of testUrls) {
    console.log(`\n📚 Testing: ${testCase.title}`);
    console.log('─'.repeat(50));
    
    // Test 1: Original URL with tracking parameters
    const originalUrl = `https://www.audible.ca${testCase.original}`;
    console.log(`🔗 Original URL: ${originalUrl}`);
    await testUrl(originalUrl, 'Original URL (with tracking)', headers);
    
    // Test 2: Cleaned URL (our new approach)
    const urlMatch = testCase.original.match(/\/pd\/([^?]+)/);
    const cleanedUrl = urlMatch 
      ? `https://www.audible.ca/pd/${urlMatch[1]}`
      : `https://www.audible.ca${testCase.original.split('?')[0]}`;
    
    console.log(`🔗 Cleaned URL: ${cleanedUrl}`);
    await testUrl(cleanedUrl, 'Cleaned URL (no tracking)', headers);
    
    // Test 3: Alternative approach - try different regions
    const alternativeUrls = [
      `https://www.audible.com/pd/${urlMatch[1]}`,
      `https://www.audible.co.uk/pd/${urlMatch[1]}`,
      `https://www.audible.com.au/pd/${urlMatch[1]}`
    ];
    
    for (let i = 0; i < alternativeUrls.length; i++) {
      const altUrl = alternativeUrls[i];
      const region = ['US', 'UK', 'AU'][i];
      console.log(`🔗 ${region} URL: ${altUrl}`);
      await testUrl(altUrl, `${region} Region`, headers);
    }
  }
}

async function testUrl(url, description, headers) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    
    const startTime = Date.now();
    const response = await axios.get(url, {
      headers,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });
    const endTime = Date.now();
    
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Content-Length: ${response.data.length}`);
    
    const html = response.data;
    
    // Check for different response types
    const checks = {
      'Product page': html.includes('product page') || html.includes('audiobook'),
      'Title found': html.includes('The Let Them Theory') || html.includes('Atmosphere') || html.includes('Great Big Beautiful Life'),
      'Access denied': html.includes('Access Denied') || html.includes('blocked'),
      'Not found': html.includes('not found') || html.includes('404'),
      'Redirect': html.includes('redirect') || html.includes('location'),
      'Audible branding': html.includes('audible') || html.includes('Audible'),
    };
    
    console.log('📋 Content Analysis:');
    Object.entries(checks).forEach(([key, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${key}`);
    });
    
    // Show page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      console.log(`📄 Page title: ${titleMatch[1]}`);
    }
    
    // Check if it's a valid product page
    if (html.includes('product page') || html.includes('audiobook')) {
      console.log('✅ This appears to be a valid product page');
    } else if (html.includes('Access Denied') || html.includes('blocked')) {
      console.log('❌ Access denied - likely region/IP blocked');
    } else if (html.includes('not found') || html.includes('404')) {
      console.log('❌ Product not found');
    } else {
      console.log('❓ Unknown response - might be a redirect or error page');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      if (error.response.status === 403) {
        console.log('❌ 403 Forbidden - likely region/IP blocked');
      } else if (error.response.status === 404) {
        console.log('❌ 404 Not Found - product doesn\'t exist');
      }
    }
  }
}

console.log('🧪 Starting URL accessibility tests...\n');
testAudibleUrls(); 