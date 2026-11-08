import type { ContentType } from './content/types';
import type { Perspective } from './content/curated-schema';
export { tagLabel } from './content/tags';

export const TYPE_LABELS: Record<ContentType, string> = {
  'concept-qa': 'Concept',
  'quick-answer': 'Quick answer',
  scenario: 'Scenario',
  coding: 'Coding',
  'system-design': 'System design',
  behavioral: 'Behavioral',
  'company-log': 'Company interview',
  note: 'Note',
};

export const PERSPECTIVE_LABELS: Record<Perspective, string> = {
  concept: 'Concept',
  practical: 'Practical',
  'trade-off': 'Trade-off',
  debugging: 'Debugging',
  scenario: 'Scenario',
  coding: 'Coding',
  design: 'Design',
  behavioral: 'Behavioral',
};

export const FREQUENCY_LABELS = { 'very-high': 'Very common', high: 'Common', medium: 'Sometimes asked' } as const;

export const ORIGIN_LABELS = { collected: 'My notes', curated: 'Curated FAQ' } as const;
