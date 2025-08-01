const axios = require('axios');

async function testPagination() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing pagination functionality...\n');
  
  try {
    // Test 1: Search for books with pagination
    console.log('📚 Test 1: Searching for books with pagination');
    const bookResponse1 = await axios.post(`${baseUrl}/api/search`, {
      query: 'fiction',
      types: ['book'],
      maxResults: 100,
      page: 1,
      pageSize: 10
    });
    
    console.log(`✅ Page 1: ${bookResponse1.data.results.length} results`);
    console.log(`   Total: ${bookResponse1.data.total}`);
    console.log(`   Total Pages: ${bookResponse1.data.totalPages}`);
    console.log(`   Page: ${bookResponse1.data.page}`);
    console.log(`   Page Size: ${bookResponse1.data.pageSize}\n`);
    
    // Test 2: Get page 2 of the same search
    const bookResponse2 = await axios.post(`${baseUrl}/api/search`, {
      query: 'fiction',
      types: ['book'],
      maxResults: 100,
      page: 2,
      pageSize: 10
    });
    
    console.log(`✅ Page 2: ${bookResponse2.data.results.length} results`);
    console.log(`   Page: ${bookResponse2.data.page}\n`);
    
    // Test 3: Search for podcasts with pagination
    console.log('🎧 Test 3: Searching for podcasts with pagination');
    const podcastResponse = await axios.post(`${baseUrl}/api/search`, {
      query: 'technology',
      types: ['podcast'],
      maxResults: 100,
      page: 1,
      pageSize: 15
    });
    
    console.log(`✅ Podcasts: ${podcastResponse.data.results.length} results`);
    console.log(`   Total: ${podcastResponse.data.total}`);
    console.log(`   Total Pages: ${podcastResponse.data.totalPages}\n`);
    
    // Test 4: Search for music with pagination
    console.log('🎵 Test 4: Searching for music with pagination');
    const musicResponse = await axios.post(`${baseUrl}/api/search`, {
      query: 'rock',
      types: ['music'],
      maxResults: 100,
      page: 1,
      pageSize: 20
    });
    
    console.log(`✅ Music: ${musicResponse.data.results.length} results`);
    console.log(`   Total: ${musicResponse.data.total}`);
    console.log(`   Total Pages: ${musicResponse.data.totalPages}\n`);
    
    // Test 5: Search for videos with pagination
    console.log('📹 Test 5: Searching for videos with pagination');
    const videoResponse = await axios.post(`${baseUrl}/api/search`, {
      query: 'tutorial',
      types: ['video'],
      maxResults: 100,
      page: 1,
      pageSize: 12
    });
    
    console.log(`✅ Videos: ${videoResponse.data.results.length} results`);
    console.log(`   Total: ${videoResponse.data.total}`);
    console.log(`   Total Pages: ${videoResponse.data.totalPages}\n`);
    
    // Test 6: Search for audiobooks with pagination
    console.log('📖 Test 6: Searching for audiobooks with pagination');
    const audiobookResponse = await axios.post(`${baseUrl}/api/search`, {
      query: 'mystery',
      types: ['audiobook'],
      maxResults: 100,
      page: 1,
      pageSize: 8
    });
    
    console.log(`✅ Audiobooks: ${audiobookResponse.data.results.length} results`);
    console.log(`   Total: ${audiobookResponse.data.total}`);
    console.log(`   Total Pages: ${audiobookResponse.data.totalPages}\n`);
    
    // Test 7: Search all types with pagination
    console.log('🔍 Test 7: Searching all types with pagination');
    const allResponse = await axios.post(`${baseUrl}/api/search`, {
      query: 'science',
      types: ['all'],
      maxResults: 100,
      page: 1,
      pageSize: 25
    });
    
    console.log(`✅ All types: ${allResponse.data.results.length} results`);
    console.log(`   Total: ${allResponse.data.total}`);
    console.log(`   Total Pages: ${allResponse.data.totalPages}\n`);
    
    console.log('🎉 All pagination tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPagination(); 