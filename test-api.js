// Simple test script to verify Google Books API key
// Run this locally with: node test-api.js

const axios = require('axios');

async function testGoogleBooksAPI() {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GOOGLE_BOOKS_API_KEY environment variable not found');
    console.log('Please set it with: export GOOGLE_BOOKS_API_KEY="your-api-key"');
    return;
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
  
  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: 'harry potter',
        maxResults: 1,
        key: apiKey
      },
      timeout: 10000
    });

    console.log('✅ API call successful!');
    console.log('Status:', response.status);
    console.log('Items found:', response.data.items?.length || 0);
    console.log('Total items:', response.data.totalItems);
    
    if (response.data.items?.[0]) {
      console.log('Sample book:', response.data.items[0].volumeInfo.title);
    }
    
  } catch (error) {
    console.error('❌ API call failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error?.message || error.message);
    console.error('Code:', error.code);
  }
}

testGoogleBooksAPI(); 