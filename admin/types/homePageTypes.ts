export interface Story {
  id: string;
  type: 'image' | 'video';
  url: string;
  duration?: number;
  header: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryPack {
  id: string;
  title: string;
  avatar: string;
  stories: Story[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  discountPercent?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  targetAudience?: string[];
  usageLimit?: number;
  currentUsage: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CuratedItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  isRecommended: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomePageConfig {
  id: string;
  storyPacks: StoryPack[];
  promotions: Promotion[];
  curatedList: {
    title: string;
    items: CuratedItem[];
  };
  isActive: boolean;
  updatedAt: Date;
}
