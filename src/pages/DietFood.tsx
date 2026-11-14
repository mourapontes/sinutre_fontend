import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react';

import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { FoodFormModal } from '@/components/modal/FoodFormModal';
import { getApiErrorMessage } from '@/lib/api';
import { deleteFood, getFoods } from '@/services/foodService';
import type { Food } from '@/types/food';
import { formatNumber } from '@/utils/number';

const MACROS = [
  { key: 'caloriesPer100g', unit: 'kcal', icon: '🔥' },
  { key: 'carbsPer100g', unit: 'g', icon: '🍞' },
  { key: 'proteinPer100g', unit: 'g', icon: '🍗' },
  { key: 'fatPer100g', unit: 'g', icon: '🥑' },
] as const;

export function DietFoodPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadFoods = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await getFoods();
      setFoods(data);
    } catch (error) {
      setLoadError(
        getApiErrorMessage(error, 'Não foi possível carregar os alimentos.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  function openCreateForm() {
    setEditingFood(null);
    setFormOpen(true);
  }

  function openEditForm(food: Food) {
    setEditingFood(food);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingFood(null);
  }

  function askDelete(food: Food) {
    setDeleteError(null);
    setFoodToDelete(food);
  }

  async function confirmDelete() {
    if (!foodToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteFood(foodToDelete.id);
      setFoodToDelete(null);
      await loadFoods();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(error, 'Não foi possível excluir o alimento.'),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SimpleHeader
          title="Dieta"
          subtitle="Gerencie seus alimentos"
        />

        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateForm}
        >
          <Plus size={18} weight="bold" />
          Novo alimento
        </button>
      </div>

      {loadError && (
        <div className="alert alert-error mt-6" role="alert">
          <span>{loadError}</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={loadFoods}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-6">Carregando...</p>
      ) : foods.length === 0 ? (
        <div className="card bg-base-100 shadow-sm mt-6">
          <div className="card-body items-start">
            <h2 className="card-title text-lg">Nenhum alimento cadastrado</h2>
            <p className="text-base-content/70">
              Cadastre um alimento para poder adicioná-lo às suas refeições.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {foods.map((food) => (
            <div
              key={food.id}
              className="card bg-base-100 shadow-sm"
            >
              <div className="card-body gap-3">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="card-title">
                    {food.name}
                  </h2>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEditForm(food)}
                      aria-label={`Alterar ${food.name}`}
                    >
                      <PencilSimple size={18} />
                      <span className="hidden sm:inline">Alterar</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => askDelete(food)}
                      aria-label={`Excluir ${food.name}`}
                    >
                      <Trash size={18} />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {MACROS.map((macro) => (
                    <span key={macro.key}>
                      {macro.icon}{' '}
                      {formatNumber(food[macro.key], 2)}
                      {' '}
                      {macro.unit}
                      <span className="text-base-content/50">
                        {' '}/ 100g
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary btn-circle btn-lg fixed bottom-6 right-6 shadow-lg z-50"
        onClick={openCreateForm}
        aria-label="Novo alimento"
      >
        <Plus size={24} weight="bold" />
      </button>

      <FoodFormModal
        open={formOpen}
        food={editingFood}
        onClose={closeForm}
        onSaved={loadFoods}
      />

      <ConfirmModal
        open={foodToDelete !== null}
        title="Excluir alimento"
        message={
          <>
            Tem certeza que deseja excluir{' '}
            <strong>{foodToDelete?.name}</strong>? Essa ação não pode ser
            desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setFoodToDelete(null)}
      />
    </div>
  );
}
