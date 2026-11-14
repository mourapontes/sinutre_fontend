export type BmiSeverity = 'low' | 'normal' | 'warning' | 'danger';

export type BmiClassification =
  | 'ABAIXO_DO_PESO'
  | 'PESO_NORMAL'
  | 'SOBREPESO'
  | 'OBESIDADE';

export interface BmiInfo {
  value: number;
  classification: BmiClassification;
  label: string;
  severity: BmiSeverity;
  range: string;
}

export interface Profile {
  targetDietDaily: number | null;
  levelActivity: string | null;
  height: number | null;
  weight: number | null;
  bmi: BmiInfo | null;
  updatedAt: string | null;
}

export interface ProfilePayload {
  targetDietDaily: number;
  height: number;
  weight: number;
  levelActivity?: string;
}

export type GoalStatus = 'ABAIXO' | 'NA_META' | 'ACIMA' | 'SEM_META';

export interface DailyCalories {
  /** Data no formato yyyy-mm-dd. */
  date: string;
  calories: number;
}

export interface Metrics {
  bmi: BmiInfo | null;
  targetDietDaily: number | null;
  averageLast7Days: number;
  totalLast7Days: number;
  dailyCalories: DailyCalories[];
  goalComparison: {
    goal: number | null;
    difference: number | null;
    percentOfGoal: number | null;
    status: GoalStatus;
  };
}
