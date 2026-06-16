// Brand Identity Constants
// Source: houses-for-sale.co.il design tokens
export const BRAND = {
  // Company Information
  name: 'הנכס בגובה העיניים',
  nameEnglish: 'The Property at Eye Level',
  tagline: 'הנכס בגובה העיניים - שיווק נדל"ן מקצועי',
  website: 'https://houses-for-sale.co.il',

  // Brand Description
  description: 'משרד שיווק נדל"ן מקצועי המתמחה בשוק הנדלן הבלעדי בקרית-אונו וסביבה',

  // Key Selling Points
  sellingPoints: [
    'ניהול נכסים בלעדיים',
    'ידע עמוק של שוק הדיור',
    'שירות אישי ומקצועי',
    'שיווק איכותי ויעיל',
    'תעודות ורישוי מלא',
    'זמינות 24/7 למשכנתאים',
  ],
} as const;

// Color Palette - From houses-for-sale.co.il
export const COLORS = {
  // Primary / Accent Colors
  primary: {
    main: '#2563eb',      // Primary accent blue — buttons, links, highlights
    dark: '#1d4ed8',      // Darker blue — hover states
    light: '#29aae3',     // Lighter blue (legacy primary)
  },

  // Secondary Colors
  secondary: {
    whatsapp: '#25d366',  // WhatsApp green
    success: '#25d366',   // Success state (WhatsApp green)
  },

  // Accent Colors
  accent: {
    success: '#25d366',   // WhatsApp green
    warning: '#f97316',   // Orange (if needed)
    danger: '#ef4444',    // Red (if needed)
    info: '#2563eb',      // Info (primary blue)
  },

  // Background & Neutral
  background: {
    primary: '#ffffff',   // Page background — white
    secondary: '#f5f4ef', // Tinted section background — warm off-white
    tertiary: '#f5f4ef',  // Tinted sections
    dark: '#171717',      // Dark section background
  },

  // Text Colors
  text: {
    primary: '#171717',   // Main dark text (headings, body on light bg)
    secondary: '#333333', // Secondary dark text
    body: '#222222',      // Body default text
    muted: '#737373',     // Muted / caption text
    light: '#ffffff',     // Text on dark backgrounds
    inverse: '#ffffff',   // Inverse text on dark backgrounds
  },

  // UI / Borders
  border: {
    light: '#e5e3dd',     // Dividers, subtle borders
    medium: '#cccccc',    // Stronger borders (ghost button)
  },
} as const;

// Typography - From houses-for-sale.co.il design system
export const FONTS = {
  // Font Families
  families: {
    body: "'Rubik', system-ui, -apple-system, sans-serif",
    display: "'Frank Ruhl Libre', Georgia, serif",
    hebrew: "Rubik, Heebo, 'Arial Hebrew', Arial, sans-serif",
    site: "Rubik, Heebo, 'Arial Hebrew', Arial, sans-serif",
    mono: "'Courier New', monospace",
  },

  // Font Sizes (in pixels for design)
  sizes: {
    small: 13,
    xs: 13,
    sm: 14,
    base: 16,
    medium: 20,
    lg: 36,
    xl: 42,
    '2xl': 64,
    '3xl': 64,
    '4xl': 140,
    h1: 140,
    h2: 64,
    h3: 42,
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
    h1: 161,
    h2: 73.6,
    h3: 48.3,
    body: 24,
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
} as const;

// Target Audience Segments - קרית-אונו וסביבה
export const TARGET_AUDIENCE = {
  segments: [
    {
      name: 'בעלי דירות למכירה',
      nameEnglish: 'Property Owners',
      description: 'בעלי נכסים המעוניינים למכור את הנכס שלהם',
      characteristics: [
        'משפחות שמעבירות עיר',
        'משקיעי נדל"ן',
        'יורשי נכסים',
      ],
    },
    {
      name: 'קונים פוטנציאליים',
      nameEnglish: 'Potential Buyers',
      description: 'משפחות וזוגות המחפשות דיור בקרית-אונו',
      characteristics: [
        'זוגות צעירים',
        'משפחות עם ילדים',
        'מבוגרים המעוניינים בדיור בכבלי עיר',
      ],
    },
    {
      name: 'דיירים למשכנתא',
      nameEnglish: 'Mortgage Seekers',
      description: 'קונים המחפשים עזרה בהשגת משכנתא',
      characteristics: [
        'קונים ראשונים',
        'משפחות מהוצאה גבוהה',
        'משקיעים מוסדיים',
      ],
    },
    {
      name: 'משקיעים וחברות',
      nameEnglish: 'Investors & Corporations',
      description: 'גופים להשקעה בנדל"ן בעיר',
      characteristics: [
        'קרנות השקעה',
        'חברות בניה',
        'משקיעים בינלאומיים',
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

// Ad Copy Templates - עברית ואנגלית
export const AD_COPY_TEMPLATES = {
  propertyShowcase: {
    headlines: [
      'דירה {property_type} בקרית-אונו',
      'מצא את הבית החלום שלך ב{location}',
      '{property_type} פנים יהלום בעיר',
      'דיור פרימיום - זמינות מוגבלת',
    ],
    descriptions: [
      'הנכס בגובה העיניים - שיווק נדל"ן מקצועי. {tagline}',
      'שירות אישי מקצועי לכל צרכי הדיור שלך.',
      'ניהול נכסים בלעדיים בעיר המובילה בביטחון וחינוך.',
    ],
    ctas: [
      'צפה בנכס',
      'קבע סיור',
      'למידע נוסף',
      'קח הצעה',
      'צור קשר',
    ],
  },

  solutionFocus: {
    headlines: [
      'חפש דיור בקרית-אונו',
      'הנכס בגובה העיניים - מומחים בשוק',
      'פתרון שיווק מקצועי לנכסים',
      'בעלות זכויות בלעדיות',
    ],
    descriptions: [
      'בחברתנו קבל שירות מסורתי עם טכנולוגיה מודרנית.',
      'ידע עמוק של שוק קרית-אונו והסביבה.',
      'אנחנו נוכל למצוא לך את הנכס המושלם.',
    ],
    ctas: [
      'התחל כעת',
      'קבע פגישה',
      'למידע נוסף',
      'הצטרף אלינו',
    ],
  },
} as const;

// Design Guidelines - from houses-for-sale.co.il
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
    badge: 3,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Button Styles
  buttons: {
    cta: {
      background: '#2563eb',
      color: '#ffffff',
      border: '1.33px solid #2563eb',
      borderRadius: '0',
      fontSize: '14px',
      fontWeight: 500,
      padding: '11px 26px',
    },
    primary: {
      background: '#2563eb',
      color: '#ffffff',
      border: '1.33px solid #2563eb',
      borderRadius: '0',
      fontSize: '13px',
      fontWeight: 500,
      padding: '14px 28px',
    },
    whatsapp: {
      background: '#25d366',
      color: '#ffffff',
      border: '1.33px solid #25d366',
      borderRadius: '0',
      fontSize: '13px',
      fontWeight: 500,
      padding: '14px 28px',
    },
    ghost: {
      background: 'transparent',
      color: '#171717',
      border: '1.33px solid #cccccc',
      borderRadius: '0',
      fontSize: '13px',
      fontWeight: 500,
      padding: '14px 28px',
    },
  },

  // Logo and brand asset paths (relative to generated folder)
  logoPath: '../../../assets/logo.png',
  faviconPath: '../../../assets/favicon.ico',
} as const;
