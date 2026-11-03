import { RecallRecord } from '../data/recallDatabase';
import { DetectedAdditive } from '../utils/additives';

export interface FamilyProfile {
  id: string;
  name: string;
  icon: string;
  allergens: string[];
  avatarUrl?: string;
}

export interface FamilyAllergenMatch {
  profileId: string;
  profileName: string;
  profileIcon: string;
  allergens: string[];
}

export interface ProductResult {
  upc: string;
  productName: string;
  brand: string;
  isRecalled: boolean;
  recallRecord: RecallRecord | null;
  terminatedNotice: {
    title: string;
    brand: string;
    date: string;
    agency: string;
    reason: string;
    severity: string;
  } | null;
  detectedAllergens: string[];
  familyMatches: FamilyAllergenMatch[];
  detectedAdditives: DetectedAdditive[];
  ingredients: string;
  stores: string[];
  states: string[];
  timestamp: string;
  status: 'clear' | 'recalled' | 'allergen_alert' | 'terminated';
  source?: 'scanner' | 'manual';
}

export interface WatchlistItem {
  upc: string;
  productName: string;
  brand: string;
  timestamp: string;
  status: 'clear' | 'recalled' | 'allergen_alert' | 'terminated';
  isRecalled: boolean;
  recallRecord?: RecallRecord | null;
  detectedAllergens?: string[];
  detectedAdditives?: DetectedAdditive[];
  ingredients?: string;
}

export interface FDACachedRecall {
  id: string;
  product: string;
  brand: string;
  reason: string;
  severity: string;
  date: string;
  status: string;
  upcs: string[];
  raw: string;
}

export type ActiveTab = 'scanner' | 'manual' | 'watchlist' | 'allergens' | 'bulletins';

export type PlusStatus = 'free' | 'trial' | 'paid' | 'expired';
