'use client';

import Icon from './Icon';

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export default function QuantitySelector({ value, onChange, min = 1, max = 99, disabled }: QuantitySelectorProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden bg-linen-white">
      <button
        onClick={decrease}
        disabled={disabled || value <= min}
        className="px-4 py-2 text-secondary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="remove" className="text-[20px]" />
      </button>
      <input
        readOnly
        value={value}
        className="w-16 text-center border-none focus:ring-0 text-on-surface bg-transparent font-body text-lg"
      />
      <button
        onClick={increase}
        disabled={disabled || value >= max}
        className="px-4 py-2 text-secondary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="add" className="text-[20px]" />
      </button>
    </div>
  );
}
