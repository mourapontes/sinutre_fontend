import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { FormField } from '@/components/forms/FormField';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import {
  ACTIVITY_LEVELS,
  DEFAULT_ACTIVITY_LEVEL,
} from '@/constants/activityLevels';
import type { ActivityLevel } from '@/constants/activityLevels';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api';
import { getProfile, updateProfile } from '@/services/profileService';
import type { Profile } from '@/types/profile';
import { formatNumber } from '@/utils/number';

interface ProfileFormState {
  targetDietDaily: string;
  height: string;
  weight: string;
  levelActivity: ActivityLevel;
}

const EMPTY_FORM: ProfileFormState = {
  targetDietDaily: '',
  height: '',
  weight: '',
  levelActivity: DEFAULT_ACTIVITY_LEVEL,
};

function isActivityLevel(value: string | null): value is ActivityLevel {
  return ACTIVITY_LEVELS.some((level) => level.value === value);
}

function toFormState(profile: Profile): ProfileFormState {
  return {
    targetDietDaily:
      profile.targetDietDaily === null ? '' : String(profile.targetDietDaily),
    height: profile.height === null ? '' : String(profile.height),
    weight: profile.weight === null ? '' : String(profile.weight),
    levelActivity: isActivityLevel(profile.levelActivity)
      ? profile.levelActivity
      : DEFAULT_ACTIVITY_LEVEL,
  };
}

function validate(form: ProfileFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const goal = Number(form.targetDietDaily);

  if (!form.targetDietDaily.trim()) {
    errors.targetDietDaily = 'Meta calórica é obrigatória.';
  } else if (!Number.isInteger(goal)) {
    errors.targetDietDaily = 'Meta calórica deve ser um número inteiro.';
  } else if (goal < 500 || goal > 10000) {
    errors.targetDietDaily = 'Meta calórica deve estar entre 500 e 10000 kcal.';
  }

  const height = Number(form.height);

  if (!form.height.trim()) {
    errors.height = 'Altura é obrigatória.';
  } else if (!Number.isFinite(height)) {
    errors.height = 'Altura deve ser um número.';
  } else if (height < 0.5 || height > 2.5) {
    errors.height = 'Altura deve estar entre 0,5 e 2,5 metros.';
  }

  const weight = Number(form.weight);

  if (!form.weight.trim()) {
    errors.weight = 'Peso é obrigatório.';
  } else if (!Number.isFinite(weight)) {
    errors.weight = 'Peso deve ser um número.';
  } else if (weight < 20 || weight > 500) {
    errors.weight = 'Peso deve estar entre 20 e 500 kg.';
  }

  return errors;
}

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setForm(toFormState(data));
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Não foi possível carregar seus dados.',
        ),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validate(form);
    setErrors(validation);
    setFeedback(null);

    if (Object.keys(validation).length > 0) {
      return;
    }

    try {
      setSaving(true);

      const updated = await updateProfile({
        targetDietDaily: Number(form.targetDietDaily),
        height: Number(form.height),
        weight: Number(form.weight),
        levelActivity: form.levelActivity,
      });

      setProfile(updated);
      setForm(toFormState(updated));
      setFeedback({
        type: 'success',
        message: 'Dados atualizados com sucesso.',
      });
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Não foi possível salvar seus dados.',
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <SimpleHeader
        title="Configurações"
        subtitle="Dados complementares do seu perfil"
      />

      {loading ? (
        <p className="mt-6">Carregando...</p>
      ) : (
        <div className="grid gap-6 mt-6 lg:grid-cols-[2fr_1fr] items-start">
          <form className="card bg-base-100 shadow-sm" onSubmit={handleSubmit} noValidate>
            <div className="card-body gap-4">
              <div>
                <h2 className="card-title text-lg">Meta e medidas</h2>
                <p className="text-sm text-base-content/70">
                  Usamos esses dados para calcular sua meta diária, seu IMC e a
                  média calórica.
                </p>
              </div>

              {feedback && (
                <div
                  className={`alert text-sm ${
                    feedback.type === 'success'
                      ? 'alert-success'
                      : 'alert-error'
                  }`}
                  role="alert"
                >
                  <span>{feedback.message}</span>
                </div>
              )}

              <FormField
                label="Meta calórica diária (kcal)"
                htmlFor="profile-goal"
              >
                <input
                  id="profile-goal"
                  type="number"
                  min="500"
                  max="10000"
                  step="1"
                  className={`input input-bordered w-full ${
                    errors.targetDietDaily ? 'input-error' : ''
                  }`}
                  placeholder="Ex: 2100"
                  value={form.targetDietDaily}
                  onChange={(event) =>
                    updateField('targetDietDaily', event.target.value)
                  }
                />
                {errors.targetDietDaily && (
                  <p className="text-error text-sm mt-1">
                    {errors.targetDietDaily}
                  </p>
                )}
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Altura (m)" htmlFor="profile-height">
                  <input
                    id="profile-height"
                    type="number"
                    min="0.5"
                    max="2.5"
                    step="0.01"
                    className={`input input-bordered w-full ${
                      errors.height ? 'input-error' : ''
                    }`}
                    placeholder="Ex: 1.75"
                    value={form.height}
                    onChange={(event) =>
                      updateField('height', event.target.value)
                    }
                  />
                  {errors.height && (
                    <p className="text-error text-sm mt-1">{errors.height}</p>
                  )}
                </FormField>

                <FormField label="Peso (kg)" htmlFor="profile-weight">
                  <input
                    id="profile-weight"
                    type="number"
                    min="20"
                    max="500"
                    step="0.1"
                    className={`input input-bordered w-full ${
                      errors.weight ? 'input-error' : ''
                    }`}
                    placeholder="Ex: 72.5"
                    value={form.weight}
                    onChange={(event) =>
                      updateField('weight', event.target.value)
                    }
                  />
                  {errors.weight && (
                    <p className="text-error text-sm mt-1">{errors.weight}</p>
                  )}
                </FormField>
              </div>

              <FormField label="Nível de atividade" htmlFor="profile-level">
                <select
                  id="profile-level"
                  className="select select-bordered w-full"
                  value={form.levelActivity}
                  onChange={(event) =>
                    updateField('levelActivity', event.target.value)
                  }
                >
                  {ACTIVITY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="card-actions justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          </form>

          <aside className="card bg-base-100 shadow-sm">
            <div className="card-body gap-2">
              <h2 className="card-title text-lg">Resumo</h2>

              {profile?.bmi ? (
                <>
                  <p className="text-sm text-base-content/70">
                    IMC atual:{' '}
                    <span className="font-semibold text-base-content">
                      {formatNumber(profile.bmi.value)} kg/m²
                    </span>
                  </p>
                  <p className="text-sm text-base-content/70">
                    Faixa: {profile.bmi.label}
                  </p>
                </>
              ) : (
                <p className="text-sm text-base-content/70">
                  Cadastre altura e peso para calcular o IMC.
                </p>
              )}

              <p className="text-sm text-base-content/70">
                Meta calórica:{' '}
                {profile?.targetDietDaily
                  ? `${formatNumber(profile.targetDietDaily, 0)} kcal`
                  : 'não definida'}
              </p>

              <Link to="/stats" className="btn btn-outline btn-sm w-fit mt-2">
                Ver métricas
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
