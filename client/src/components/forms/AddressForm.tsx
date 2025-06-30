
import React, { useEffect } from 'react';
import { InputMask } from './InputMask';
import { useMask } from '../../hooks/useMask';
import { useCep } from '../../hooks/useCep';
import { Search } from 'lucide-react';

interface AddressFormProps {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  onAddressChange: (field: string, value: string) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  cep,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  onAddressChange
}) => {
  const cepMask = useMask('cep');
  const { buscar, endereco: enderecoEncontrado, loading } = useCep();

  useEffect(() => {
    cepMask.setValue(cep);
  }, [cep]);

  useEffect(() => {
    if (enderecoEncontrado) {
      onAddressChange('endereco', enderecoEncontrado.logradouro || '');
      onAddressChange('bairro', enderecoEncontrado.bairro || '');
      onAddressChange('cidade', enderecoEncontrado.localidade || '');
      onAddressChange('estado', enderecoEncontrado.uf || '');
    }
  }, [enderecoEncontrado, onAddressChange]);

  const handleCepChange = (value: string) => {
    cepMask.handleChange(value);
    onAddressChange('cep', value.replace(/\D/g, ''));
    
    if (value.replace(/\D/g, '').length === 8) {
      buscar(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <div className="relative">
            <InputMask
              value={cepMask.value}
              onChange={handleCepChange}
              placeholder="00000-000"
              className="pr-10"
              required
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="animate-spin" size={16} />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <InputMask
            value={numero}
            onChange={(value) => onAddressChange('numero', value)}
            placeholder="123"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
        <InputMask
          value={endereco}
          onChange={(value) => onAddressChange('endereco', value)}
          placeholder="Rua, Avenida..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
        <InputMask
          value={complemento}
          onChange={(value) => onAddressChange('complemento', value)}
          placeholder="Apto, Bloco, Casa..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
          <InputMask
            value={bairro}
            onChange={(value) => onAddressChange('bairro', value)}
            placeholder="Bairro"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <InputMask
            value={cidade}
            onChange={(value) => onAddressChange('cidade', value)}
            placeholder="Cidade"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <InputMask
            value={estado}
            onChange={(value) => onAddressChange('estado', value)}
            placeholder="SP"
            required
          />
        </div>
      </div>
    </div>
  );
};
