
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMask } from '../../hooks/useMask';
import { AddressForm } from './AddressForm';
import { Cliente } from '../../types';

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSave: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    tipo_documento: 'cpf' as 'cpf' | 'cnpj',
    data_nascimento: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    observacoes: ''
  });

  const telefoneMask = useMask('phone');
  const cpfMask = useMask('cpf');
  const cnpjMask = useMask('cnpj');

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        cpf_cnpj: cliente.cpf_cnpj || '',
        tipo_documento: cliente.tipo_documento || 'cpf',
        data_nascimento: cliente.data_nascimento || '',
        cep: cliente.cep || '',
        endereco: cliente.endereco || '',
        numero: cliente.numero || '',
        complemento: cliente.complemento || '',
        bairro: cliente.bairro || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        observacoes: cliente.observacoes || ''
      });
      
      // Configurar máscaras com valores existentes
      telefoneMask.setValue(cliente.telefone || '');
      if (cliente.tipo_documento === 'cpf') {
        cpfMask.setValue(cliente.cpf_cnpj || '');
      } else {
        cnpjMask.setValue(cliente.cpf_cnpj || '');
      }
    }
  }, [cliente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTelefoneChange = (value: string) => {
    telefoneMask.handleChange(value);
    updateField('telefone', value);
  };

  const handleDocumentoChange = (value: string) => {
    if (formData.tipo_documento === 'cpf') {
      cpfMask.handleChange(value);
    } else {
      cnpjMask.handleChange(value);
    }
    updateField('cpf_cnpj', value);
  };

  const handleTipoDocumentoChange = (tipo: 'cpf' | 'cnpj') => {
    updateField('tipo_documento', tipo);
    updateField('cpf_cnpj', '');
    cpfMask.reset();
    cnpjMask.reset();
  };

  const handleAddressChange = (field: string, value: string) => {
    updateField(field, value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={telefoneMask.value}
                  onChange={(e) => handleTelefoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={formData.tipo_documento}
                  onChange={(e) => handleTipoDocumentoChange(e.target.value as 'cpf' | 'cnpj')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.tipo_documento === 'cpf' ? 'CPF' : 'CNPJ'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tipo_documento === 'cpf' ? cpfMask.value : cnpjMask.value}
                  onChange={(e) => handleDocumentoChange(e.target.value)}
                  placeholder={formData.tipo_documento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => updateField('data_nascimento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900">Endereço</h3>
            <AddressForm
              cep={formData.cep}
              endereco={formData.endereco}
              numero={formData.numero}
              complemento={formData.complemento}
              bairro={formData.bairro}
              cidade={formData.cidade}
              estado={formData.estado}
              onAddressChange={handleAddressChange}
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => updateField('observacoes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observações adicionais sobre o cliente..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {cliente ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
