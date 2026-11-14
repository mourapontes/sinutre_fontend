import type { MacroSummary } from '@/types/meal';
import { MacroStat } from './MacroStat';

interface MacroStatsBarProps {
  summary: MacroSummary;
}

export function MacroStatsBar({ summary }: MacroStatsBarProps) {
  const goal = summary.caloriesGoal;
  const hasGoal = goal !== null && goal > 0;
  const exceeded = hasGoal && summary.calories > goal;
  const percent = hasGoal
    ? Math.round((summary.calories / goal) * 100)
    : null;

  const variant = !hasGoal
    ? 'default'
    : exceeded
      ? 'danger'
      : 'highlight';

  return (
    <section className="stats stats-vertical lg:stats-horizontal shadow-sm w-full bg-base-100">
      <MacroStat
        label="Carboidratos"
        value={Math.round(summary.carbs)}
        unit="g"
      />
      <MacroStat
        label="Proteínas"
        value={Math.round(summary.proteins)}
        unit="g"
      />
      <MacroStat
        label="Gordura"
        value={Math.round(summary.fats)}
        unit="g"
      />
      <MacroStat
        label="Calorias / Meta Diária"
        value={Math.round(summary.calories)}
        unit="kcal"
        variant={variant}
        goal={goal}
        hint={
          percent === null
            ? 'Defina sua meta em Configurações'
            : exceeded
              ? `Meta ultrapassada (${percent}%)`
              : `${percent}% da meta`
        }
      />
    </section>
  );
}
