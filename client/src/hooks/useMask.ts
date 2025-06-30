
import { useState, useCallback } from 'react';
import { formatCPF, formatCNPJ, formatPhone, formatCEP } from '../utils/masks';

type MaskType = 'cpf' | 'cnpj' | 'phone' | 'cep';

export const useMask = (type: MaskType) => {
  const [value, setValue] = useState('');

  const handleChange = useCallback((inputValue: string) => {
    let maskedValue = '';
    
    switch (type) {
      case 'cpf':
        maskedValue = formatCPF(inputValue);
        break;
      case 'cnpj':
        maskedValue = formatCNPJ(inputValue);
        break;
      case 'phone':
        maskedValue = formatPhone(inputValue);
        break;
      case 'cep':
        maskedValue = formatCEP(inputValue);
        break;
      default:
        maskedValue = inputValue;
    }
    
    setValue(maskedValue);
  }, [type]);

  const reset = useCallback(() => {
    setValue('');
  }, []);

  return {
    value,
    setValue,
    handleChange,
    reset
  };
};
