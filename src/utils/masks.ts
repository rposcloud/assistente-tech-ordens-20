export const formatCPF = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatCNPJ = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const formatCEP = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Remove todos os caracteres exceto números, vírgula e ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '');
  
  if (!cleanValue) return 0;
  
  // Se contém vírgula, trata como separador decimal brasileiro
  if (cleanValue.includes(',')) {
    const parts = cleanValue.split(',');
    if (parts.length === 2) {
      // Remove pontos da parte inteira (milhares) e trata vírgula como decimal
      const integerPart = parts[0].replace(/\./g, '');
      const decimalPart = parts[1].substring(0, 2); // Máximo 2 casas decimais
      const result = parseFloat(`${integerPart}.${decimalPart}`);
      return isNaN(result) ? 0 : result;
    }
  }
  
  // Se não tem vírgula, trata como número normal
  const numericValue = parseFloat(cleanValue.replace(/\./g, ''));
  if (isNaN(numericValue)) return 0;
  
  // Se o valor é muito pequeno, assume que são centavos
  if (numericValue < 100 && !cleanValue.includes('.')) {
    return numericValue / 100;
  }
  
  return numericValue;
};

export const formatCurrencyInput = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Se não há números, retorna vazio
  if (!numbers) return '';
  
  // Converte para número e formata como moeda
  const amount = parseFloat(numbers) / 100;
  
  // Evita valores inválidos
  if (isNaN(amount)) return '';
  
  return formatCurrency(amount);
};

// Função auxiliar para validar se um valor monetário é válido
export const isValidCurrency = (value: string): boolean => {
  const parsed = parseCurrency(value);
  return parsed >= 0 && !isNaN(parsed);
};
