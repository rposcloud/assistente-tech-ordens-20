
import { useState, useCallback } from 'react';
import { buscarCEP } from '../utils/cep';
import { EnderecoViaCep } from '../types';

export const useCep = () => {
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState<EnderecoViaCep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (cep: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await buscarCEP(cep);
      
      if (resultado) {
        setEndereco(resultado);
      } else {
        setError('CEP não encontrado');
      }
    } catch (err) {
      setError('Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setEndereco(null);
    setError(null);
  }, []);

  return {
    loading,
    endereco,
    error,
    buscar,
    limpar
  };
};
