
import React, { useState } from 'react';
import { Link, Copy, Check, Calendar, ExternalLink } from 'lucide-react';
import { OrdemServico } from '../../types';
import { generateToken, generateExpirationDate } from '../../utils/tokenUtils';

interface GenerateLinkModalProps {
  ordem: OrdemServico;
  onClose: () => void;
  onSave: (ordemAtualizada: OrdemServico) => void;
}

export const GenerateLinkModal = ({ ordem, onClose, onSave }: GenerateLinkModalProps) => {
  const [expirationDays, setExpirationDays] = useState(30);
  const [linkGerado, setLinkGerado] = useState<string>('');
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateLink = () => {
    setLoading(true);
    
    // Gera novo token se não existir
    const token = ordem.link_token || generateToken();
    const expiresAt = generateExpirationDate(expirationDays);
    
    const ordemAtualizada = {
      ...ordem,
      link_token: token,
      link_expires_at: expiresAt
    };

    // Gera a URL do portal
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/portal/${token}`;
    
    setLinkGerado(link);
    onSave(ordemAtualizada);
    setLoading(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkGerado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const handleOpenLink = () => {
    window.open(linkGerado, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Link className="h-5 w-5 mr-2 text-blue-600" />
            Portal do Cliente
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm mb-4">
                Gere um link seguro para que o cliente possa visualizar e imprimir a ordem de serviço.
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <strong>OS #{ordem.numero}</strong>
                <br />
                {ordem.marca} {ordem.modelo}
              </div>
            </div>

            {!linkGerado && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Validade do Link (dias)
                </label>
                <select
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </select>
              </div>
            )}

            {linkGerado && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link do Portal do Cliente
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={linkGerado}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    title="Copiar link"
                  >
                    {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleOpenLink}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    title="Abrir link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
                {copiado && (
                  <p className="text-green-600 text-xs mt-1">Link copiado!</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {linkGerado ? 'Fechar' : 'Cancelar'}
            </button>
            {!linkGerado && (
              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Gerando...' : 'Gerar Link'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
