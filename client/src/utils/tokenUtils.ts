
// Função para gerar token único
export const generateToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Função para validar se um token não expirou
export const isTokenValid = (expiresAt?: string): boolean => {
  if (!expiresAt) return true; // Token sem expiração
  return new Date() < new Date(expiresAt);
};

// Função para gerar data de expiração (30 dias por padrão)
export const generateExpirationDate = (days: number = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
