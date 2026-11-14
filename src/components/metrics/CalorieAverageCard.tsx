import { Link } from 'react-router-dom';

import type { GoalStatus, Metrics } from '@/types/profile';
import { formatNumber } from '@/utils/number';

const STATUS_STYLES: Record<
  GoalStatus,
  { label: string; badge: string; description: string }
> = {
  ABAIXO: {
    label: 'Abaixo da meta',
    badge: 'badge-info',
    description: 'Sua média está abaixo da meta diária definida.',
  },
  NA_META: {
    label: 'Dentro da meta',
    badge: 'badge-success',
    description: 'Sua média está alinhada com a meta diária definida.',
  },
  ACIMA: {
    label: 'Acima da meta',
    badge: 'badge-error',
    description: 'Sua média está acima da meta diária definida.',
  },
  SEM_META: {
    label: 'Sem meta definida',
    badge: 'badge-ghost',
    description: 'Defina sua meta calórica para comparar com a média.',
  },
};

function dayLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

interface CalorieAverageCardProps {
  metrics: Metrics;
}

export function CalorieAverageCard({ metrics }: CalorieAverageCardProps) {
  const { goalComparison, dailyCalories, averageLast7Days } = metrics;
  const status = STATUS_STYLES[goalComparison.status];
  const goal = goalComparison.goal;

  const maxCalories = Math.max(
    goal ?? 0,
    ...dailyCalories.map((day) => day.calories),
    1,
  );

  const percent = goalComparison.percentOfGoal;

  return (
    <section className="card bg-base-100 shadow-sm h-full">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="card-title text-lg">Média calórica (7 dias)</h2>

          <span className={`badge ${status.badge} badge-lg`}>
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="text-5xl font-bold leading-none">
            {formatNumber(averageLast7Days)}
          </span>
          <span className="text-base-content/60 pb-1">kcal/dia</span>

          {goal !== null && (
            <span className="text-base-content/60 pb-1">
              Meta: {formatNumber(goal, 0)} kcal
            </span>
          )}
        </div>

        <p className="text-sm text-base-content/70">
          {status.description}
          {goalComparison.difference !== null && (
            <>
              {' '}
              Diferença de{' '}
              <span className="font-medium">
                {goalComparison.difference > 0 ? '+' : ''}
                {formatNumber(goalComparison.difference)} kcal/dia
              </span>
              .
            </>
          )}
        </p>

        {percent !== null && (
          <div>
            <div className="flex justify-between text-xs text-base-content/60 mb-1">
              <span>{formatNumber(percent)}% da meta</span>
              <span>100%</span>
            </div>

            <progress
              className="progress progress-primary w-full"
              value={Math.min(percent, 100)}
              max={100}
            />
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-base-content/60 mb-2">
            Calorias por dia
          </p>

          <div className="flex h-32 items-end gap-2">
            {dailyCalories.map((day) => {
              const height = Math.max((day.calories / maxCalories) * 100, 2);

              return (
                <div
                  key={day.date}
                  className="flex h-full flex-1 flex-col items-center gap-1"
                  title={`${dayLabel(day.date)}: ${formatNumber(day.calories)} kcal`}
                >
                  <span className="text-[10px] text-base-content/60">
                    {day.calories > 0 ? formatNumber(day.calories, 0) : '-'}
                  </span>

                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-primary/80"
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-base-content/50">
                    {dayLabel(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {goal === null && (
          <Link to="/settings" className="btn btn-primary btn-sm w-fit">
            Definir meta calórica
          </Link>
        )}
      </div>
    </section>
  );
}
