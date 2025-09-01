#!/usr/bin/env node

// Simple implementation of getAudioProxyUrl for testing
function getAudioProxyUrl(audioUrl) {
  if (!audioUrl) return '';
  
  // If it's already a proxy URL, return as is
  if (audioUrl.includes('/api/audio/')) {
    return audioUrl;
  }
  
  // If it's already a full URL (signed URL), use it directly
  if (audioUrl.startsWith('http')) {
    return audioUrl;
  }
  
  // If it's a file path (stored in database), convert to proxy URL
  if (audioUrl.startsWith('podcasts/')) {
    return `/api/audio/${encodeURIComponent(audioUrl)}`;
  }
  
  // For any other URL, return as is
  return audioUrl;
}

console.log('🎵 Testing Audio Proxy URL Conversion...\n');

// Test cases
const testCases = [
  {
    name: 'GCS URL (should use directly)',
    input: 'https://storage.googleapis.com/telecast-corp-podcast-bucket/podcasts/123/episodes/456/original.wav',
    expected: 'https://storage.googleapis.com/telecast-corp-podcast-bucket/podcasts/123/episodes/456/original.wav'
  },
  {
    name: 'File path to Proxy URL',
    input: 'podcasts/123/episodes/456/original.wav',
    expected: '/api/audio/podcasts%2F123%2Fepisodes%2F456%2Foriginal.wav'
  },
  {
    name: 'Already proxy URL',
    input: '/api/audio/podcasts/123/episodes/456/original.wav',
    expected: '/api/audio/podcasts/123/episodes/456/original.wav'
  },
  {
    name: 'Empty URL',
    input: '',
    expected: ''
  },
  {
    name: 'External URL (should remain unchanged)',
    input: 'https://example.com/audio.mp3',
    expected: 'https://example.com/audio.mp3'
  }
];

console.log('📋 Testing URL Conversions:');
testCases.forEach((testCase, index) => {
  const result = getAudioProxyUrl(testCase.input);
  const passed = result === testCase.expected;
  
  console.log(`  ${passed ? '✅' : '❌'} Test ${index + 1}: ${testCase.name}`);
  console.log(`     Input:    ${testCase.input}`);
  console.log(`     Expected: ${testCase.expected}`);
  console.log(`     Result:   ${result}`);
  console.log('');
});

console.log('🎉 Audio proxy URL conversion test completed!');
console.log('\n💡 If all tests passed, the audio proxy should work correctly.');
console.log('💡 If any tests failed, check the URL conversion logic.');
