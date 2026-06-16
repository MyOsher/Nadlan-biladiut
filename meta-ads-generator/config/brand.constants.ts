// Brand Identity Constants
export const BRAND = {
  // Company Information
  name: 'Nadlan Biladiut',
  tagline: 'Exclusive Real Estate Management Made Simple',
  website: 'https://nadlan-biladiut.com',

  // Brand Description
  description: 'Professional property management platform for exclusive real estate markets',

  // Key Selling Points
  sellingPoints: [
    'Exclusive property tracking and management',
    'Real-time market insights and analytics',
    'Secure client relationship management',
    'Automated listing distribution',
    'Advanced privacy controls',
    'Professional collaboration tools',
  ],
} as const;

// Color Palette
export const COLORS = {
  // Primary Colors
  primary: {
    main: '#1E3A8A',      // Deep blue
    light: '#3B82F6',     // Bright blue
    dark: '#1E40AF',      // Dark blue
  },

  // Secondary Colors
  secondary: {
    main: '#F59E0B',      // Amber
    light: '#FBBF24',     // Light amber
    dark: '#D97706',      // Dark amber
  },

  // Accent Colors
  accent: {
    success: '#10B981',   // Green
    warning: '#F97316',   // Orange
    danger: '#EF4444',    // Red
    info: '#06B6D4',      // Cyan
  },

  // Background & Neutral
  background: {
    primary: '#FFFFFF',   // White
    secondary: '#F9FAFB', // Light gray
    tertiary: '#F3F4F6',  // Medium light gray
  },

  // Text Colors
  text: {
    primary: '#111827',   // Very dark gray
    secondary: '#4B5563', // Medium gray
    light: '#9CA3AF',     // Light gray
    inverse: '#FFFFFF',   // White
  },
} as const;

// Typography
export const FONTS = {
  // Font Families
  families: {
    heading: "'Helvetica Neue', Arial, sans-serif",
    body: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    mono: "'Courier New', monospace",
  },

  // Font Sizes (in pixels for design)
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font Weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
} as const;

// Target Audience Segments
export const TARGET_AUDIENCE = {
  segments: [
    {
      name: 'Property Owners',
      description: 'Individuals and corporations managing multiple properties',
      characteristics: [
        'High net worth individuals',
        'Property investors',
        'Real estate portfolios',
      ],
    },
    {
      name: 'Real Estate Agents',
      description: 'Professional agents seeking advanced management tools',
      characteristics: [
        'Independent agents',
        'Boutique agencies',
        'High-volume agents',
      ],
    },
    {
      name: 'Property Developers',
      description: 'Developers managing large portfolios and exclusivity',
      characteristics: [
        'Commercial developers',
        'Residential developers',
        'Luxury market developers',
      ],
    },
    {
      name: 'Investment Firms',
      description: 'Institutional investors managing real estate portfolios',
      characteristics: [
        'Private equity firms',
        'REITs',
        'Asset managers',
      ],
    },
  ],
} as const;

// Ad Formats Configuration
export const AD_FORMATS = {
  // Instagram Feed - Square
  instagramFeed: {
    name: 'Instagram Feed',
    format: 'square',
    dimensions: {
      width: 1200,
      height: 1200,
    },
    aspectRatio: '1:1',
    maxTextLength: 125,
    description: 'Static image ads for Instagram feed',
    platforms: ['instagram'],
  },

  // Instagram Stories - Portrait
  instagramStories: {
    name: 'Instagram Stories',
    format: 'portrait',
    dimensions: {
      width: 1080,
      height: 1920,
    },
    aspectRatio: '9:16',
    maxTextLength: 150,
    description: 'Full-screen portrait ads for Instagram Stories',
    platforms: ['instagram'],
  },

  // Facebook Feed - Landscape
  facebookFeed: {
    name: 'Facebook Feed',
    format: 'landscape',
    dimensions: {
      width: 1200,
      height: 628,
    },
    aspectRatio: '1.91:1',
    maxTextLength: 125,
    description: 'Landscape ads for Facebook news feed',
    platforms: ['facebook'],
  },

  // Facebook Stories - Portrait
  facebookStories: {
    name: 'Facebook Stories',
    format: 'portrait',
    dimensions: {
      width: 1080,
      height: 1920,
    },
    aspectRatio: '9:16',
    maxTextLength: 150,
    description: 'Full-screen portrait ads for Facebook Stories',
    platforms: ['facebook'],
  },

  // Carousel - Square (multiple cards)
  carousel: {
    name: 'Carousel',
    format: 'square',
    dimensions: {
      width: 1200,
      height: 1200,
    },
    aspectRatio: '1:1',
    maxTextLength: 90,
    maxCards: 10,
    minCards: 2,
    description: 'Multi-card carousel ads for Facebook and Instagram',
    platforms: ['facebook', 'instagram'],
  },

  // Collection - Square
  collection: {
    name: 'Collection',
    format: 'square',
    dimensions: {
      width: 1200,
      height: 1200,
    },
    aspectRatio: '1:1',
    maxTextLength: 125,
    description: 'Product showcase collection format',
    platforms: ['facebook', 'instagram'],
  },
} as const;

// Ad Copy Templates
export const AD_COPY_TEMPLATES = {
  propertyShowcase: {
    headlines: [
      'Exclusive {property_type} Available Now',
      'Discover {property_type} in {location}',
      '{property_type} Excellence Awaits',
      'Premium {property_type} - Limited Availability',
    ],
    descriptions: [
      'Manage your exclusive properties with confidence. {tagline}',
      'Professional property management for discerning owners. {tagline}',
      'Elevate your property management strategy. {tagline}',
    ],
    ctas: [
      'View Property',
      'Schedule Tour',
      'Learn More',
      'Get Started',
      'Contact Us',
    ],
  },

  solutionFocus: {
    headlines: [
      'Simplify Property Management',
      'Take Control of Your Portfolio',
      'Professional Property Solutions',
      'Exclusive Market Expertise',
    ],
    descriptions: [
      'Streamline operations and maximize returns with {name}.',
      'Advanced tools for serious property managers.',
      'Your competitive advantage in luxury real estate.',
    ],
    ctas: [
      'Start Free Trial',
      'Schedule Demo',
      'Learn Features',
      'Join Today',
    ],
  },
} as const;

// Design Guidelines
export const DESIGN_GUIDELINES = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },

  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Logo and brand asset paths (relative to generated folder)
  logoPath: '../../../assets/logo.png',
  faviconPath: '../../../assets/favicon.ico',
} as const;
