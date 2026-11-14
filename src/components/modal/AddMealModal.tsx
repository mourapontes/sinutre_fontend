import { useMemo, useState } from 'react';

import { MEAL_CATEGORY_BY_ID } from '@/constants/mealCategories';
import { getApiErrorMessage } from '@/lib/api';
import { createMeal } from '@/services/mealService';
import type { FoodItem, MealCategory, MealState } from '@/types/meal';
import { MealItemForm } from './MealItemForm';
import { MealItemsTable } from './MealItemsTable';
import { MealMacrosSummary } from './MealMacrosSummary';
import { MealMetadataForm } from './MealMetadataForm';

interface AddMealModalProps {
  typeMeal: MealCategory;
  onClose: () => void;
  onMealCreated: () => Promise<void>;
}

function nowLocalDateTime(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function AddMealModal({
  typeMeal,
  onClose,
  onMealCreated,
}: AddMealModalProps) {
  const category = MEAL_CATEGORY_BY_ID[typeMeal];

  const [meal, setMeal] = useState<MealState>({
    description: '',
    type: category.id,
    eatTime: nowLocalDateTime(),
  });

  const [items, setItems] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleAddItem(item: FoodItem) {
    setItems((current) => [...current, item]);
  }

  function handleRemoveItem(item: FoodItem) {
    setItems((current) =>
      current.filter((x) => x.id !== item.id),
    );
  }

  async function handleSaveMeal() {
    if (items.length === 0) {
      setError('Adicione ao menos um alimento à refeição.');
      return;
    }

    if (!meal.eatTime) {
      setError('Informe a data e o horário da refeição.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await createMeal({
        ...meal,
        description: meal.description.trim() || undefined,
        items: items.map((item) => ({
          foodId: item.foodId,
          grams: item.grams,
        })),
      });

      await onMealCreated();
      onClose();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Não foi possível salvar a refeição.',
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  const macros = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.carbs += item.carbs;
          acc.proteins += item.protein;
          acc.fats += item.fat;
          acc.calories += item.calories;

          return acc;
        },
        {
          carbs: 0,
          proteins: 0,
          fats: 0,
          calories: 0,
          caloriesGoal: null,
        },
      ),
    [items],
  );

  return (
    <div className="modal modal-open" role="dialog">
      <div className="modal-box max-w-6xl">
        <h2 className="text-3xl font-semibold mb-6">Adicionar Refeição</h2>

        {error && (
          <div className="alert alert-error text-sm mb-4" role="alert">
            <span>{error}</span>
          </div>
        )}

        <MealMacrosSummary macros={macros} />
        <MealMetadataForm meal={meal} setMeal={setMeal} />

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Itens da Refeição</h3>
          <MealItemForm onAdd={handleAddItem} />
        </div>

        <MealItemsTable items={items} onRemove={handleRemoveItem} />

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveMeal}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar refeição'}
          </button>
        </div>
      </div>
    </div>
  );
}
