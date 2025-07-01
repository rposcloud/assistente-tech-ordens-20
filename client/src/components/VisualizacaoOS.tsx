import React from 'react';
import { OrdemDetalhes } from '../hooks/useOrdemDetalhes';
import { formatCurrency } from '../utils/masks';
import { 
  User, 
  Wrench, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  FileText,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface VisualizacaoOSProps {
  ordem: OrdemDetalhes;
}

export const VisualizacaoOS: React.FC<VisualizacaoOSProps> = ({ ordem }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      aberta: 'bg-blue-100 text-blue-800',
      em_andamento: 'bg-yellow-100 text-yellow-800',
      aguardando_pecas: 'bg-orange-100 text-orange-800',
      pronta: 'bg-green-100 text-green-800',
      finalizada: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      aberta: 'Aberta',
      em_andamento: 'Em Andamento',
      aguardando_pecas: 'Aguardando Peças',
      pronta: 'Pronta',
      finalizada: 'Finalizada'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-gray-100 text-gray-800',
      media: 'bg-blue-100 text-blue-800',
      alta: 'bg-yellow-100 text-yellow-800',
      urgente: 'bg-red-100 text-red-800'
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadeText = (prioridade: string) => {
    const prioridadeTexts = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      urgente: 'Urgente'
    };
    return prioridadeTexts[prioridade as keyof typeof prioridadeTexts] || prioridade;
  };

  return (
    <div className="bg-white p-6 print:p-4 max-w-full">
      {/* Cabeçalho da OS */}
      <div className="text-center mb-6 print:mb-4 border-b-2 border-blue-600 pb-4 print:pb-2">
        <h1 className="text-3xl print:text-xl font-bold text-blue-600 mb-3 print:mb-2">
          ORDEM DE SERVIÇO
        </h1>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 print:gap-2 print:flex-row">
          <span className="text-2xl print:text-lg font-bold text-gray-800">
            Nº {ordem.numero}
          </span>
          <div className="flex gap-2 print:gap-1">
            <span className={`px-3 py-1 print:px-2 print:py-0 rounded-full text-sm print:text-xs font-medium ${getStatusColor(ordem.status)}`}>
              {getStatusText(ordem.status)}
            </span>
            <span className={`px-3 py-1 print:px-2 print:py-0 rounded-full text-sm print:text-xs font-medium ${getPrioridadeColor(ordem.prioridade)}`}>
              {getPrioridadeText(ordem.prioridade)}
            </span>
          </div>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2">
          <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">
            <Calendar className="h-5 w-5 print:h-4 print:w-4 text-blue-600" />
            Datas
          </h3>
          <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
            <div>
              <span className="font-medium text-gray-600">Abertura:</span>
              <p className="text-gray-900">{new Date(ordem.data_abertura).toLocaleDateString('pt-BR')}</p>
            </div>
            {ordem.data_previsao_entrega && (
              <div>
                <span className="font-medium text-gray-600">Previsão:</span>
                <p className="text-gray-900">{new Date(ordem.data_previsao_entrega).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            {ordem.data_conclusao && (
              <div>
                <span className="font-medium text-gray-600">Conclusão:</span>
                <p className="text-gray-900">{new Date(ordem.data_conclusao).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2">
          <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">
            <User className="h-5 w-5 print:h-4 print:w-4 text-blue-600" />
            Cliente
          </h3>
          <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
            <div>
              <span className="font-medium text-gray-600">Nome:</span>
              <p className="text-gray-900">{ordem.clientes?.nome || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Telefone:</span>
              <p className="text-gray-900">{ordem.clientes?.telefone || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Email:</span>
              <p className="text-gray-900 break-all">{ordem.clientes?.email || 'N/A'}</p>
            </div>
            {ordem.clientes?.cpf_cnpj && (
              <div>
                <span className="font-medium text-gray-600">CPF/CNPJ:</span>
                <p className="text-gray-900">{ordem.clientes.cpf_cnpj}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2">
          <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">
            <Wrench className="h-5 w-5 print:h-4 print:w-4 text-blue-600" />
            Equipamento
          </h3>
          <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
            <div>
              <span className="font-medium text-gray-600">Tipo:</span>
              <p className="text-gray-900 capitalize">{ordem.tipo_equipamento}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Marca:</span>
              <p className="text-gray-900">{ordem.marca || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Modelo:</span>
              <p className="text-gray-900">{ordem.modelo || 'N/A'}</p>
            </div>
            {ordem.numero_serie && (
              <div>
                <span className="font-medium text-gray-600">N° Série:</span>
                <p className="text-gray-900">{ordem.numero_serie}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problema e Diagnóstico */}
      <div className="grid grid-cols-1 gap-4 print:gap-2 mb-6 print:mb-4">
        <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2">
          <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">
            <AlertCircle className="h-5 w-5 print:h-4 print:w-4 text-red-600" />
            Defeito Relatado
          </h3>
          <p className="text-sm print:text-xs text-gray-900 whitespace-pre-wrap">
            {ordem.defeito_relatado || 'Não informado'}
          </p>
        </div>

        {ordem.diagnostico_tecnico && (
          <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2">
            <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">
              <FileText className="h-5 w-5 print:h-4 print:w-4 text-blue-600" />
              Diagnóstico Técnico
            </h3>
            <p className="text-sm print:text-xs text-gray-900 whitespace-pre-wrap">
              {ordem.diagnostico_tecnico}
            </p>
          </div>
        )}

        {ordem.solucao_aplicada && (
          <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2">
            <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">
              <CheckCircle className="h-5 w-5 print:h-4 print:w-4 text-green-600" />
              Solução Aplicada
            </h3>
            <p className="text-sm print:text-xs text-gray-900 whitespace-pre-wrap">
              {ordem.solucao_aplicada}
            </p>
          </div>
        )}
      </div>

      {/* Produtos e Peças Utilizados */}
      {((ordem.produtos_utilizados && ordem.produtos_utilizados.length > 0) || 
        (ordem.pecas_utilizadas && ordem.pecas_utilizadas.length > 0)) && (
        <div className="mb-6 print:mb-4">
          <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-4 print:mb-2 text-gray-800">
            <Package className="h-5 w-5 print:h-4 print:w-4 text-blue-600" />
            Produtos e Serviços Utilizados
          </h3>

          <div className="space-y-3 print:space-y-2">
            {/* Produtos */}
            {ordem.produtos_utilizados?.map((item, index) => (
              <div key={index} className="border border-blue-200 bg-blue-50 print:bg-white rounded-lg p-3 print:p-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm print:text-xs">
                      {item.produto?.nome || 'Produto não encontrado'}
                    </h4>
                    {item.produto?.descricao && (
                      <p className="text-xs print:text-xs text-gray-600 mt-1">
                        {item.produto.descricao}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs print:text-xs text-gray-500">
                      <span>Categoria: <strong>{item.produto?.categoria || 'N/A'}</strong></span>
                      <span>Qtd: <strong>{item.quantidade}</strong></span>
                    </div>
                  </div>
                  <div className="text-right ml-4 text-sm print:text-xs">
                    <div className="text-gray-500">Unit: {formatCurrency(item.valor_unitario)}</div>
                    <div className="font-medium text-gray-900">Total: {formatCurrency(item.valor_total)}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Peças */}
            {ordem.pecas_utilizadas?.map((item, index) => (
              <div key={index} className="border border-orange-200 bg-orange-50 print:bg-white rounded-lg p-3 print:p-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm print:text-xs">{item.nome}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs print:text-xs text-gray-500">
                      <span>Categoria: <strong>Peça</strong></span>
                      <span>Qtd: <strong>{item.quantidade}</strong></span>
                    </div>
                  </div>
                  <div className="text-right ml-4 text-sm print:text-xs">
                    <div className="text-gray-500">Unit: {formatCurrency(item.valor_unitario)}</div>
                    <div className="font-medium text-gray-900">Total: {formatCurrency(item.valor_total)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Valores */}
      <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2 mb-6 print:mb-4">
        <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-4 print:mb-2 text-gray-800">
          <DollarSign className="h-5 w-5 print:h-4 print:w-4 text-green-600" />
          Valores
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
          <div className="space-y-2 print:space-y-1 text-sm print:text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Mão de Obra:</span>
              <span className="font-medium">{formatCurrency(ordem.valor_mao_obra)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peças/Serviços:</span>
              <span className="font-medium">{formatCurrency(parseFloat(ordem.valor_total.toString()) - parseFloat(ordem.valor_mao_obra.toString()))}</span>
            </div>
            {ordem.desconto && parseFloat(ordem.desconto.toString()) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Desconto:</span>
                <span className="font-medium">- {formatCurrency(ordem.desconto)}</span>
              </div>
            )}
            {ordem.acrescimo && parseFloat(ordem.acrescimo.toString()) > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Acréscimo:</span>
                <span className="font-medium">+ {formatCurrency(ordem.acrescimo)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center print:justify-start">
            <div className="text-center print:text-left">
              <p className="text-sm print:text-xs text-gray-500 mb-1">VALOR TOTAL</p>
              <p className="text-3xl print:text-xl font-bold text-green-600">
                {formatCurrency(ordem.valor_final)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      {ordem.observacoes_internas && (
        <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2 mb-6 print:mb-4">
          <h3 className="flex items-center gap-2 text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">
            <FileText className="h-5 w-5 print:h-4 print:w-4 text-gray-600" />
            Observações
          </h3>
          <p className="text-sm print:text-xs text-gray-900 whitespace-pre-wrap">
            {ordem.observacoes_internas}
          </p>
        </div>
      )}

      {/* Garantia e Responsáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 mb-8 print:mb-6">
        <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2">
          <h3 className="text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">Garantia</h3>
          <p className="text-sm print:text-xs text-gray-900">
            {ordem.garantia || 0} dias a partir da data de conclusão
          </p>
        </div>

        {ordem.tecnico_responsavel && (
          <div className="bg-gray-50 print:bg-white print:border border-gray-200 rounded-lg p-4 print:p-2">
            <h3 className="text-lg print:text-sm font-semibold mb-3 print:mb-2 text-gray-800">Técnico Responsável</h3>
            <p className="text-sm print:text-xs text-gray-900">{ordem.tecnico_responsavel}</p>
          </div>
        )}
      </div>

      {/* Assinaturas */}
      <div className="mt-12 print:mt-8 pt-8 print:pt-4 border-t-2 border-gray-200">
        <div className="grid grid-cols-2 gap-16 print:gap-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-3 print:pt-2 mt-16 print:mt-8">
              <p className="text-sm print:text-xs font-medium text-gray-600">ASSINATURA DO CLIENTE</p>
              <p className="text-sm print:text-xs text-gray-800 mt-1">{ordem.clientes?.nome}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-3 print:pt-2 mt-16 print:mt-8">
              <p className="text-sm print:text-xs font-medium text-gray-600">ASSINATURA DO TÉCNICO</p>
              <p className="text-sm print:text-xs text-gray-800 mt-1">{ordem.tecnico_responsavel || 'Técnico Responsável'}</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 print:mt-4 text-xs print:text-xs text-gray-500">
          <p>Este documento serve como comprovante do serviço prestado.</p>
          <p>Garantia válida por {ordem.garantia || 0} dias a partir da data de conclusão.</p>
        </div>
      </div>
    </div>
  );
};