import { DomainId } from './types';

// Single source of truth for category display names
export const categoryNames: Record<string, string> = {
  'elections': 'Election Interference',
  'rule-of-law': 'Legal / Defying Court Orders',
  'national-security': 'National Security',
  'civil-discourse': 'Intimidation & Political Violence',
  'regulatory-stability': 'Business Interference',
  'trade-policy': 'Major Economic Disruptions',
  'government-contracts': 'Cronyism & Retaliation',
  'fiscal-policy': 'Fiscal & Monetary Policy',
  'public-pressure': 'Public Pressure & Polarization',
  'media-freedom': 'Suppression of Freedom of Expression',
  'institutional-integrity': 'Erosion of Institutions & Norms',
};

// Domain display names
export const domainNames: Record<DomainId, string> = {
  'rule-of-law': 'Rule of Law & National Security',
  'operating-economic': 'Operating & Economic Environment',
  'societal-institutional': 'Societal & Institutional Integrity',
};

// Domain-to-category mapping (4-5-2 split)
export const DOMAINS: Record<DomainId, string[]> = {
  'rule-of-law': ['elections', 'rule-of-law', 'national-security', 'civil-discourse'],
  'operating-economic': ['regulatory-stability', 'trade-policy', 'government-contracts', 'fiscal-policy', 'public-pressure'],
  'societal-institutional': ['media-freedom', 'institutional-integrity'],
};

// All category IDs in canonical order
export const ALL_CATEGORY_IDS = [
  'elections', 'rule-of-law', 'national-security', 'civil-discourse',
  'regulatory-stability', 'trade-policy', 'government-contracts', 'fiscal-policy', 'public-pressure',
  'media-freedom', 'institutional-integrity',
] as const;
