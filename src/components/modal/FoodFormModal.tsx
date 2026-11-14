import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { FormField } from '@/components/forms/FormField';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api';
import { createFood, updateFood } from '@/services/foodService';
import type { Food } from '@/types/food';

interface FoodFormModalProps {
  open: boolean;
  /** Alimento em edição; `null` significa cadastro de um novo alimento. */
  food: Food | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

type NumericField =
  | 'caloriesPer100g'
  | 'carbsPer100g'
  | 'proteinPer100g'
  | 'fatPer100g';

type FoodFormState = Record<'name' | NumericField, string>;

const NUMERIC_LIMITS: Record<NumericField, { label: string; max: number }> = {
  caloriesPer100g: { label: 'Calorias por 100g', max: 900 },
  carbsPer100g: { label: 'Carboidratos por 100g', max: 100 },
  proteinPer100g: { label: 'Proteínas por 100g', max: 100 },
  fatPer100g: { label: 'Gorduras por 100g', max: 100 },
};

const NUMERIC_FIELDS = Object.keys(NUMERIC_LIMITS) as NumericField[];

const EMPTY_FORM: FoodFormState = {
  name: '',
  caloriesPer100g: '',
  carbsPer100g: '',
  proteinPer100g: '',
  fatPer100g: '',
};

function toFormState(food: Food | null): FoodFormState {
  if (!food) {
    return EMPTY_FORM;
  }

  return {
    name: food.name,
    caloriesPer100g: String(food.caloriesPer100g),
    carbsPer100g: String(food.carbsPer100g),
    proteinPer100g: String(food.proteinPer100g),
    fatPer100g: String(food.fatPer100g),
  };
}

function validate(form: FoodFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = form.name.trim();

  if (!name) {
    errors.name = 'Nome é obrigatório.';
  } else if (name.length > 120) {
    errors.name = 'Nome deve ter no máximo 120 caracteres.';
  }

  for (const field of NUMERIC_FIELDS) {
    const { label, max } = NUMERIC_LIMITS[field];
    const raw = form[field].trim();

    if (!raw) {
      errors[field] = `${label} é obrigatório.`;
      continue;
    }

    const value = Number(raw);

    if (!Number.isFinite(value)) {
      errors[field] = `${label} deve ser um número.`;
      continue;
    }

    if (value < 0) {
      errors[field] = `${label} não pode ser negativo.`;
      continue;
    }

    if (value > max) {
      errors[field] = `${label} deve ser no máximo ${max}.`;
    }
  }

  return errors;
}

export function FoodFormModal({
  open,
  food,
  onClose,
  onSaved,
}: FoodFormModalProps) {
  const [form, setForm] = useState<FoodFormState>(() => toFormState(food));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(food));
      setErrors({});
      setFormError(null);
      setLoading(false);
    }
  }, [open, food]);

  const isEditing = food !== null;

  function updateField(field: keyof FoodFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validate(form);
    setErrors(validation);
    setFormError(null);

    if (Object.keys(validation).length > 0) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      caloriesPer100g: Number(form.caloriesPer100g),
      carbsPer100g: Number(form.carbsPer100g),
      proteinPer100g: Number(form.proteinPer100g),
      fatPer100g: Number(form.fatPer100g),
    };

    try {
      setLoading(true);

      if (isEditing) {
        await updateFood(food.id, payload);
      } else {
        await createFood(payload);
      }

      await onSaved();
      onClose();
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      setFormError(
        getApiErrorMessage(error, 'Não foi possível salvar o alimento.'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`modal ${open ? 'modal-open' : ''}`} role="dialog">
      <form className="modal-box max-w-xl" onSubmit={handleSubmit} noValidate>
        <h3 className="font-bold text-lg">
          {isEditing ? 'Alterar alimento' : 'Novo alimento'}
        </h3>

        <p className="text-sm text-base-content/70 mt-1">
          Informe os valores nutricionais por 100 g.
        </p>

        {formError && (
          <div className="alert alert-error text-sm mt-4" role="alert">
            <span>{formError}</span>
          </div>
        )}

        <div className="grid gap-4 mt-4">
          <FormField label="Nome" htmlFor="food-name">
            <input
              id="food-name"
              type="text"
              className={`input input-bordered w-full ${
                errors.name ? 'input-error' : ''
              }`}
              placeholder="Ex: Arroz integral"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
            {errors.name && (
              <p className="text-error text-sm mt-1">{errors.name}</p>
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            {NUMERIC_FIELDS.map((field) => {
              const { label } = NUMERIC_LIMITS[field];
              const inputId = `food-${field}`;

              return (
                <FormField key={field} label={label} htmlFor={inputId}>
                  <input
                    id={inputId}
                    type="number"
                    min="0"
                    step="0.1"
                    className={`input input-bordered w-full ${
                      errors[field] ? 'input-error' : ''
                    }`}
                    placeholder="0"
                    value={form[field]}
                    onChange={(event) =>
                      updateField(field, event.target.value)
                    }
                  />
                  {errors[field] && (
                    <p className="text-error text-sm mt-1">{errors[field]}</p>
                  )}
                </FormField>
              );
            })}
          </div>
        </div>

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
