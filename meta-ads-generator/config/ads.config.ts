export interface AdConfig {
  name: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export const META_AD_DIMENSIONS = {
  SQUARE: {
    width: 1200,
    height: 1200,
  },
  LANDSCAPE: {
    width: 1200,
    height: 628,
  },
  VERTICAL: {
    width: 1080,
    height: 1350,
  },
  STORY: {
    width: 1080,
    height: 1920,
  },
} as const;

export const DEFAULT_AD_CONFIG: AdConfig = {
  name: 'Meta Ads',
  description: 'Generated Meta advertisements using Google Generative AI',
  dimensions: META_AD_DIMENSIONS.SQUARE,
};
