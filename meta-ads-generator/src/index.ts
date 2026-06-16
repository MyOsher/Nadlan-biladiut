import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is required');
}

console.log('Meta Ads Generator initialized');
console.log('Google API Key configured:', GOOGLE_API_KEY.substring(0, 5) + '...');
