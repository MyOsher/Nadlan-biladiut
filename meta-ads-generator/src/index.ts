import dotenv from 'dotenv';
import { BRAND, COLORS, FONTS, TARGET_AUDIENCE, AD_FORMATS } from '../config/brand.constants';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is required');
}

console.log('🎨 Meta Ads Generator initialized');
console.log(`Brand: ${BRAND.name}`);
console.log(`Tagline: ${BRAND.tagline}`);
console.log(`\n📊 Available ad formats: ${Object.keys(AD_FORMATS).length}`);
console.log(`🎯 Target audience segments: ${TARGET_AUDIENCE.segments.length}`);
console.log(`\n✅ Google API Key configured: ${GOOGLE_API_KEY.substring(0, 5)}...`);
