import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WarningCircle } from '@phosphor-icons/react';

import { AddMealCard } from '@/components/cards/AddMealCard';
import { TotalMealsCard } from '@/components/cards/TotalMealsCard';
import { Header } from '@/components/layout/Header';
import { MacroStatsBar } from '@/components/macros/MacroStatsBar';
import { MealFab } from '@/components/meals/MealFab';
import { MealsList } from '@/components/meals/MealsList';
import { MealsTable } from '@/components/meals/MealsTable';
import { AddMealModal } from '@/components/modal/AddMealModal';
import { useAuth } from '@/context/AuthContext';
import { useMealModal } from '@/hooks/useMealModal';
import { api, getApiErrorMessage } from '@/lib/api';
import { getProfile } from '@/services/profileService';
import type { MacroSummary } from '@/types/meal';
import type { Meal } from '@/types/mealSummary';
import { formatNumber } from '@/utils/number';

interface DashboardPageProps {
  drawerId: string;
}

export function DashboardPage({ drawerId }: DashboardPageProps) {
  const { user } = useAuth();
  const modal = useMealModal();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [caloriesGoal, setCaloriesGoal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoadError(null);

      const [mealsResponse, profile] = await Promise.all([
        api.get<Meal[]>('/meals'),
        getProfile(),
      ]);

      setMeals(mealsResponse.data);
      setCaloriesGoal(profile.targetDietDaily);
    } catch (error) {
      setLoadError(
        getApiErrorMessage(
          error,
          'Não foi possível carregar o dashboard.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadMeals() {
    const response = await api.get<Meal[]>('/meals');
    setMeals(response.data);
  }

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const mealsSummary = useMemo(() => {
    const today = new Date();

    const total = meals.length;

    const todayCount = meals.filter((meal) => {
      const date = new Date(meal.eatTime);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;

    const monthCount = meals.filter((meal) => {
      const date = new Date(meal.eatTime);

      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;

    return {
      total,
      thisMonth: monthCount,
      today: todayCount,
    };
  }, [meals]);

  const todayTotals = useMemo(() => {
    const today = new Date();

    return meals
      .filter((meal) => {
        const date = new Date(meal.eatTime);

        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      })
      .reduce(
        (acc, meal) => {
          acc.carbs += meal.totals.carbs;
          acc.proteins += meal.totals.proteins;
          acc.fats += meal.totals.fats;
          acc.calories += meal.totals.calories;

          return acc;
        },
        {
          carbs: 0,
          proteins: 0,
          fats: 0,
          calories: 0,
        },
      );
  }, [meals]);

  const macroSummary: MacroSummary = {
    ...todayTotals,
    caloriesGoal,
  };

  const goalExceeded =
    caloriesGoal !== null && todayTotals.calories > caloriesGoal;

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span className="text-gray-500">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto mb-8">
        <Header
          drawerId={drawerId}
          userName={user.name}
          avatarUrl={user.avatarUrl}
        />

        {loadError && (
          <div className="alert alert-error" role="alert">
            <span>{loadError}</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={loadDashboard}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {goalExceeded && caloriesGoal !== null && (
          <div className="alert alert-error" role="alert">
            <WarningCircle size={22} weight="fill" />
            <span>
              Você ultrapassou sua meta diária em{' '}
              <strong>
                {formatNumber(todayTotals.calories - caloriesGoal, 0)} kcal
              </strong>
              . Consumido: {formatNumber(todayTotals.calories, 0)} de{' '}
              {formatNumber(caloriesGoal, 0)} kcal.
            </span>
          </div>
        )}

        {caloriesGoal === null && (
          <div className="alert alert-warning" role="status">
            <span>
              Defina sua meta calórica em{' '}
              <Link to="/settings" className="link font-medium">
                Configurações
              </Link>{' '}
              para acompanhar o dia.
            </span>
          </div>
        )}

        <MacroStatsBar summary={macroSummary} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-stretch">
          <TotalMealsCard summary={mealsSummary} />
          <AddMealCard onSelectCategory={modal.openWith} />
        </div>

        <MealsTable meals={meals} />
        <MealsList meals={meals} />
      </div>

      <MealFab onSelectCategory={modal.openWith} />

      {modal.selectedCategory && (
        <AddMealModal
          typeMeal={modal.selectedCategory}
          onClose={modal.close}
          onMealCreated={loadMeals}
        />
      )}
    </>
  );
}
