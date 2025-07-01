import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Wrench, Package, CreditCard, FileText, Clock, Shield, Building } from 'lucide-react';

interface OrdemPrintViewProps {
  ordem: any;
  profile?: any;
}

const statusColors = {
  'aberta': 'bg-blue-100 text-blue-800 border-blue-200',
  'em_andamento': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'aguardando_pecas': 'bg-orange-100 text-orange-800 border-orange-200',
  'pronta': 'bg-green-100 text-green-800 border-green-200',
  'finalizada': 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusLabels = {
  'aberta': 'Aberta',
  'em_andamento': 'Em Andamento',
  'aguardando_pecas': 'Aguardando Peças',
  'pronta': 'Pronta',
  'finalizada': 'Finalizada'
};

const prioridadeColors = {
  'baixa': 'bg-green-50 text-green-700 border-green-200',
  'normal': 'bg-blue-50 text-blue-700 border-blue-200',
  'alta': 'bg-orange-50 text-orange-700 border-orange-200',
  'urgente': 'bg-red-50 text-red-700 border-red-200'
};

export const OrdemPrintView: React.FC<OrdemPrintViewProps> = ({ ordem, profile }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não informada';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  return (
    <div id="ordem-print-content" className="w-full max-w-none p-4 space-y-4 bg-white">
      {/* Cabeçalho da Empresa */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 border border-gray-200 rounded-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {profile?.empresa || 'Nome da Empresa'}
                </h2>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <p>CNPJ: {profile?.cnpj || 'Não informado'}</p>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600 max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">Endereço:</p>
                <p>{profile?.endereco || 'Endereço não informado'}</p>
                <p>{profile?.bairro ? `${profile.bairro} - ` : ''}CEP: {profile?.cep || 'Não informado'}</p>
                <p>{profile?.cidade ? `${profile.cidade}/${profile.estado}` : 'Cidade/Estado não informado'}</p>
              </div>
              <div className="mt-2 space-y-1">
                <p><span className="font-medium">Tel:</span> {profile?.telefone || 'Não informado'}</p>
                {profile?.email && (
                  <p><span className="font-medium">Email:</span> {profile.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cabeçalho da Ordem de Serviço */}
      <div className="border-l-4 border-l-blue-500 bg-white border border-gray-200 rounded-lg">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Ordem de Serviço #{ordem.numero}
              </h1>
              <p className="text-gray-600 text-sm">
                {ordem.clientes?.nome} - {ordem.clientes?.telefone}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={`px-2 py-1 text-xs font-medium border ${statusColors[ordem.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {statusLabels[ordem.status as keyof typeof statusLabels] || ordem.status}
              </Badge>
              <Badge className={`px-2 py-1 text-xs font-medium border ${prioridadeColors[ordem.prioridade as keyof typeof prioridadeColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {ordem.prioridade?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 1: Cliente e Equipamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Informações do Cliente */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-blue-600" />
              Cliente
            </h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-medium text-gray-700">Nome:</p>
                <p className="text-gray-900">{ordem.clientes?.nome}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Telefone:</p>
                <p className="text-gray-900">{ordem.clientes?.telefone}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-700">E-mail:</p>
                <p className="text-gray-900">{ordem.clientes?.email || 'Não informado'}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-700">Endereço:</p>
                <p className="text-gray-900 text-xs">
                  {ordem.clientes?.endereco ? 
                    `${ordem.clientes.endereco}, ${ordem.clientes.numero || 'S/N'} - ${ordem.clientes.bairro}, ${ordem.clientes.cidade}/${ordem.clientes.estado}` 
                    : 'Não informado'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Equipamento */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Package className="h-4 w-4 text-green-600" />
              Equipamento
            </h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-medium text-gray-700">Tipo:</p>
                <p className="text-gray-900 capitalize">{ordem.tipo_equipamento}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Marca:</p>
                <p className="text-gray-900">{ordem.marca}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Modelo:</p>
                <p className="text-gray-900">{ordem.modelo}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">N° Série:</p>
                <p className="text-gray-900">{ordem.numero_serie || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-700">Senha:</p>
                <p className="text-gray-900">{ordem.senha_equipamento || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição do Problema */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-3 border-b border-gray-100">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-orange-600" />
            Descrição do Problema
          </h3>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Defeito Relatado:</p>
            <p className="text-xs text-gray-900 bg-gray-50 p-2 rounded border">
              {ordem.defeito_relatado}
            </p>
          </div>
          
          {ordem.diagnostico_tecnico && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Diagnóstico Técnico:</p>
              <p className="text-xs text-gray-900 bg-blue-50 p-2 rounded border border-blue-200">
                {ordem.diagnostico_tecnico}
              </p>
            </div>
          )}
          
          {ordem.solucao_aplicada && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Solução Aplicada:</p>
              <p className="text-xs text-gray-900 bg-green-50 p-2 rounded border border-green-200">
                {ordem.solucao_aplicada}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Produtos e Serviços */}
      {(ordem.produtos_utilizados?.length > 0 || ordem.pecas_utilizadas?.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Wrench className="h-4 w-4 text-purple-600" />
              Produtos e Serviços Utilizados
            </h3>
          </div>
          <div className="p-3">
            <div className="space-y-2">
              {ordem.produtos_utilizados?.map((produto: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">{produto.produto?.nome}</p>
                    <p className="text-xs text-gray-600">
                      {produto.quantidade}x - {formatCurrency(produto.valor_unitario)} cada
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    {formatCurrency(produto.valor_total)}
                  </p>
                </div>
              ))}
              
              {ordem.pecas_utilizadas?.map((peca: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">{peca.nome}</p>
                    <p className="text-xs text-gray-600">
                      {peca.quantidade}x - {formatCurrency(peca.valor_unitario)} cada
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    {formatCurrency(peca.valor_total)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Linha 2: Serviço e Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Informações de Serviço */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-indigo-600" />
              Serviço
            </h3>
          </div>
          <div className="p-3">
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-medium text-gray-700">Data Abertura:</p>
                <p className="text-gray-900">{formatDate(ordem.data_abertura)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Técnico:</p>
                <p className="text-gray-900">{ordem.tecnico_responsavel || 'Não atribuído'}</p>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                <div>
                  <p className="font-medium text-gray-700">Garantia: {ordem.garantia} dias</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Resumo Financeiro
            </h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mão de Obra:</span>
                  <span>{formatCurrency(ordem.valor_mao_obra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orçamento:</span>
                  <span>{formatCurrency(ordem.valor_orcamento)}</span>
                </div>
                {parseFloat(ordem.desconto || '0') > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>- {formatCurrency(ordem.desconto)}</span>
                  </div>
                )}
                {parseFloat(ordem.acrescimo || '0') > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Acréscimo:</span>
                    <span>+ {formatCurrency(ordem.acrescimo)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">VALOR TOTAL</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(ordem.valor_total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observações Internas */}
      {ordem.observacoes_internas && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold">Observações Internas</h3>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-900 bg-yellow-50 p-2 rounded border border-yellow-200">
              {ordem.observacoes_internas}
            </p>
          </div>
        </div>
      )}

      {/* Campos de Assinatura */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-3 border-b border-gray-100">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-blue-600" />
            Assinaturas
          </h3>
        </div>
        <div className="p-4">
          {/* Assinaturas lado a lado */}
          <div className="grid grid-cols-2 gap-6 mb-4">
            {/* Assinatura do Cliente */}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-700 mb-2">Assinatura do Cliente</p>
              <div className="border-b-2 border-gray-300 h-10 mb-2"></div>
              <div className="text-xs text-gray-600">
                <p className="font-medium">{ordem.clientes?.nome}</p>
                <p>CPF/CNPJ: {ordem.clientes?.cpf_cnpj || 'Não informado'}</p>
                <p>Data: ___/___/______</p>
              </div>
            </div>

            {/* Assinatura do Técnico */}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-700 mb-2">Assinatura do Técnico</p>
              <div className="border-b-2 border-gray-300 h-10 mb-2"></div>
              <div className="text-xs text-gray-600">
                <p className="font-medium">{ordem.tecnico_responsavel || 'Técnico Responsável'}</p>
                <p>Empresa: {profile?.empresa || 'Nome da Empresa'}</p>
                <p>Data: ___/___/______</p>
              </div>
            </div>
          </div>

          {/* Termo de Responsabilidade */}
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium text-center">TERMO DE RESPONSABILIDADE</p>
              <p className="text-justify leading-tight">
                Declaro que recebi o equipamento descrito nesta ordem de serviço em perfeitas condições de funcionamento e que todos os serviços foram executados conforme solicitado. Estou ciente da garantia oferecida e das condições de uso.{ordem.garantia && ` A garantia dos serviços prestados é de ${ordem.garantia} dias a partir da data de entrega.`}
              </p>
              <p className="text-center mt-2 text-xs">
                <strong>Data de entrega:</strong> ___/___/______ às ___:___ h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};