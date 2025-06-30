
import React from 'react';
import { formatCurrencyInput, parseCurrency } from '../../utils/masks';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "R$ 0,00",
  required = false,
  className = "",
  'data-testid': testId
}) => {
  const [displayValue, setDisplayValue] = React.useState(() => {
    return value > 0 ? formatCurrencyInput((value * 100).toString()) : '';
  });

  const handleInputChange = (inputValue: string) => {
    setDisplayValue(inputValue);
    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={(e) => handleInputChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      data-testid={testId}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  );
};
