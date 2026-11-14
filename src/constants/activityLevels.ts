export type ActivityLevel =
  | 'SEDENTARIO'
  | 'LEVEMENTE_ATIVO'
  | 'MODERADAMENTE_ATIVO'
  | 'MUITO_ATIVO'
  | 'EXTREMAMENTE_ATIVO';

export interface ActivityLevelInfo {
  value: ActivityLevel;
  label: string;
}

export const ACTIVITY_LEVELS: readonly ActivityLevelInfo[] = [
  { value: 'SEDENTARIO', label: 'Sedentário' },
  { value: 'LEVEMENTE_ATIVO', label: 'Levemente ativo' },
  { value: 'MODERADAMENTE_ATIVO', label: 'Moderadamente ativo' },
  { value: 'MUITO_ATIVO', label: 'Muito ativo' },
  { value: 'EXTREMAMENTE_ATIVO', label: 'Extremamente ativo' },
] as const;

export const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = 'MODERADAMENTE_ATIVO';
