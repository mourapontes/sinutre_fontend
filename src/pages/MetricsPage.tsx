import { useCallback, useEffect, useState } from 'react';

import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { BmiCard } from '@/components/metrics/BmiCard';
import { CalorieAverageCard } from '@/components/metrics/CalorieAverageCard';
import { getApiErrorMessage } from '@/lib/api';
import { getMetrics } from '@/services/metricsService';
import type { Metrics } from '@/types/profile';

export function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await getMetrics();
      setMetrics(data);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Não foi possível carregar as métricas.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <SimpleHeader
        title="Métricas"
        subtitle="Acompanhe seu IMC e sua média calórica"
      />

      {error && (
        <div className="alert alert-error mt-6" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={loadMetrics}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-6">Carregando...</p>
      ) : metrics ? (
        <div className="grid gap-6 mt-6 lg:grid-cols-2 items-stretch">
          <BmiCard bmi={metrics.bmi} />
          <CalorieAverageCard metrics={metrics} />
        </div>
      ) : null}
    </div>
  );
}
