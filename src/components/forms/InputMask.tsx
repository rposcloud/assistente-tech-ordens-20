
import React from 'react';
import { Input } from '@/components/ui/input';

interface InputMaskProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export const InputMask: React.FC<InputMaskProps> = ({
  value,
  onChange,
  placeholder,
  className,
  required = false,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      required={required}
      disabled={disabled}
    />
  );
};
