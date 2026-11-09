import type { Frequency, Perspective } from './content/schema';

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

export const FREQUENCY_LABELS: Record<Frequency, string> = { 'very-high': 'Very common', high: 'Common', medium: 'Sometimes asked' };

export const minutes = (m: number) => (m < 60 ? `${m} min` : `${Math.round((m / 60) * 10) / 10} h`);
