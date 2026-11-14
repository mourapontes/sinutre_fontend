import { Link } from 'react-router-dom';

import type { BmiInfo, BmiSeverity } from '@/types/profile';
import { formatNumber } from '@/utils/number';

const SEVERITY_STYLES: Record<BmiSeverity, { badge: string; text: string }> = {
  low: { badge: 'badge-info', text: 'text-info' },
  normal: { badge: 'badge-success', text: 'text-success' },
  warning: { badge: 'badge-warning', text: 'text-warning' },
  danger: { badge: 'badge-error', text: 'text-error' },
};

// Escala visual do IMC: de 15 a 40 cobre todas as faixas da OMS.
const SCALE_MIN = 15;
const SCALE_MAX = 40;

const SCALE = [
  { label: 'Abaixo do peso', width: 14, bar: 'bg-info/70' },
  { label: 'Peso normal', width: 26, bar: 'bg-success/70' },
  { label: 'Sobrepeso', width: 20, bar: 'bg-warning/70' },
  { label: 'Obesidade', width: 40, bar: 'bg-error/70' },
] as const;

interface BmiCardProps {
  bmi: BmiInfo | null;
}

export function BmiCard({ bmi }: BmiCardProps) {
  if (!bmi) {
    return (
      <section className="card bg-base-100 shadow-sm h-full">
        <div className="card-body">
          <h2 className="card-title text-lg">IMC</h2>

          <p className="text-sm text-base-content/70">
            Para calcular o IMC precisamos da sua altura e do seu peso.
          </p>

          <Link to="/settings" className="btn btn-primary btn-sm w-fit mt-2">
            Cadastrar dados
          </Link>
        </div>
      </section>
    );
  }

  const styles = SEVERITY_STYLES[bmi.severity];
  const clamped = Math.min(Math.max(bmi.value, SCALE_MIN), SCALE_MAX);
  const markerPosition =
    ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

  return (
    <section className="card bg-base-100 shadow-sm h-full">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="card-title text-lg">IMC</h2>

          <span className={`badge ${styles.badge} badge-lg`}>
            {bmi.label}
          </span>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold leading-none">
            {formatNumber(bmi.value)}
          </span>
          <span className="text-base-content/60 pb-1">kg/m²</span>
        </div>

        <div>
          <div className="relative flex h-3 overflow-visible rounded-full">
            {SCALE.map((step) => (
              <div
                key={step.label}
                className={`${step.bar} first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${step.width}%` }}
              />
            ))}

            <div
              className="absolute top-1/2"
              style={{ left: `${markerPosition}%` }}
              aria-hidden="true"
            >
              <span className="block h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral ring-2 ring-base-100" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-base-content/60 sm:grid-cols-4">
            {SCALE.map((step) => (
              <span key={step.label} className="flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${step.bar}`} />
                {step.label}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-base-content/70">
          Faixa de referência da OMS:{' '}
          <span className={`font-medium ${styles.text}`}>{bmi.range}</span>
        </p>
      </div>
    </section>
  );
}
