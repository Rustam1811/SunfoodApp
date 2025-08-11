// Story domain types

export type StoryVisibility = 'public' | 'closeFriends' | 'private';

export interface StoryBase {
  id: string;
  type: 'image' | 'video' | 'text';
  order: number;
  durationMs?: number; // custom duration override
  createdAt: number; // timestamp ms
  updatedAt?: number;
  expireAt?: number; // timestamp for auto-expire
  link?: string;
  linkText?: string;
  visibility?: StoryVisibility; // close friends etc
  category?: string; // grouping or tab
  authorId: string;
}

export interface ImageStory extends StoryBase {
  type: 'image';
  mediaPath: string; // storage path
  width?: number;
  height?: number;
  blurHash?: string;
}

export interface VideoStory extends StoryBase {
  type: 'video';
  mediaPath: string;
  aspect?: number; // width/height
  mutedDefault?: boolean;
  posterPath?: string;
}

export interface TextStory extends StoryBase {
  type: 'text';
  text: string;
  background: { kind: 'solid' | 'gradient'; value: string };
}

export type StoryItem = ImageStory | VideoStory | TextStory;

export interface StoryAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  order: number;
  isActive: boolean;
  categories?: string[];
  closeFriendsOnly?: boolean;
  badges?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface StoryReaction {
  id: string;
  storyId: string;
  userId: string;
  emoji: string; // any emoji
  createdAt: number;
}

export interface CloseFriendsRule {
  id: string; // rule id
  minOrders?: number;
  consecutiveDays?: number; // days in a row
  periodDays?: number; // window for minOrders
  active: boolean;
}
