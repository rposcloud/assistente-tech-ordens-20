import React, { forwardRef } from 'react';
import { OrdemServico, Cliente } from '../../types';
import { formatCurrency } from '../../utils/masks';
import { CompanyProfile } from '../../hooks/useProfile';

interface OrderPrintProps {
  ordem: OrdemServico;
  cliente: Cliente;
  companyProfile?: CompanyProfile | null;
}

export const OrderPrint = forwardRef<HTMLDivElement, OrderPrintProps>(
  ({ ordem, cliente, companyProfile }, ref) => {
    const getStatusText = (status: string) => {
      const statusTexts = {
        aguardando_diagnostico: 'Aguardando Diagnóstico',
        aguardando_aprovacao: 'Aguardando Aprovação',
        aguardando_pecas: 'Aguardando Peças',
        em_reparo: 'Em Reparo',
        pronto_entrega: 'Pronto para Entrega',
        entregue: 'Entregue'
      };
      return statusTexts[status as keyof typeof statusTexts] || status;
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
        {/* Cabeçalho da Empresa - dados básicos no topo */}
        <div className="border-b-2 border-blue-600 pb-4 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-600 mb-1">
              {companyProfile?.empresa || 'TechService'}
            </h1>
            <div className="text-sm text-gray-600 space-x-3">
              {companyProfile?.telefone && (
                <span>Tel: {companyProfile.telefone}</span>
              )}
              {companyProfile?.email_empresa && (
                <span>Email: {companyProfile.email_empresa}</span>
              )}
              {companyProfile?.cnpj && (
                <span>CNPJ: {companyProfile.cnpj}</span>
              )}
            </div>
          </div>
        </div>

        {/* Título da OS */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">ORDEM DE SERVIÇO</h2>
          <p className="text-lg text-gray-600">Nº {ordem.numero}</p>
        </div>

        {/* Informações do Cliente */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">DADOS DO CLIENTE</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Nome:</strong> {cliente.nome}</p>
              <p><strong>Documento:</strong> {cliente.cpf_cnpj}</p>
              {cliente.telefone && <p><strong>Telefone:</strong> {cliente.telefone}</p>}
              {cliente.email && <p><strong>Email:</strong> {cliente.email}</p>}
              {cliente.endereco && (
                <p><strong>Endereço:</strong> {cliente.endereco}, {cliente.numero}</p>
              )}
              {cliente.cidade && (
                <p><strong>Cidade:</strong> {cliente.cidade}/{cliente.estado}</p>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">DADOS DA ORDEM</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Data Abertura:</strong> {new Date(ordem.data_abertura).toLocaleDateString('pt-BR')}</p>
              <p><strong>Status:</strong> {getStatusText(ordem.status)}</p>
              {ordem.prazo_entrega && (
                <p><strong>Prazo:</strong> {new Date(ordem.prazo_entrega).toLocaleDateString('pt-BR')}</p>
              )}
              <p><strong>Garantia:</strong> {ordem.garantia} dias</p>
              {ordem.tecnico_responsavel && (
                <p><strong>Técnico:</strong> {ordem.tecnico_responsavel}</p>
              )}
            </div>
          </div>
        </div>

        {/* Informações do Equipamento */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">EQUIPAMENTO</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><strong>Tipo:</strong> {ordem.tipo_equipamento}</p>
            <p><strong>Marca/Modelo:</strong> {ordem.marca} {ordem.modelo}</p>
            {ordem.numero_serie && <p><strong>Nº Série:</strong> {ordem.numero_serie}</p>}
            {ordem.senha_equipamento && <p><strong>Senha:</strong> {ordem.senha_equipamento}</p>}
          </div>
          {ordem.acessorios && (
            <div className="mt-3">
              <p className="text-sm"><strong>Acessórios:</strong> {ordem.acessorios}</p>
            </div>
          )}
          {ordem.condicoes_equipamento && (
            <div className="mt-3">
              <p className="text-sm"><strong>Condições:</strong> {ordem.condicoes_equipamento}</p>
            </div>
          )}
        </div>

        {/* Defeito e Diagnóstico */}
        <div className="space-y-4 mb-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-bold text-gray-800 mb-2">DEFEITO RELATADO</h4>
            <p className="text-sm">{ordem.defeito_relatado}</p>
          </div>

          {ordem.diagnostico_tecnico && (
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">DIAGNÓSTICO TÉCNICO</h4>
              <p className="text-sm">{ordem.diagnostico_tecnico}</p>
            </div>
          )}

          {ordem.solucao_aplicada && (
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">SOLUÇÃO APLICADA</h4>
              <p className="text-sm">{ordem.solucao_aplicada}</p>
            </div>
          )}
        </div>

        {/* Produtos e Serviços Utilizados */}
        {((ordem as any).produtos_utilizados?.length > 0 || (ordem as any).pecas_utilizadas?.length > 0) && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">PRODUTOS E SERVIÇOS UTILIZADOS</h3>
            <div className="space-y-3">
              {/* Produtos */}
              {(ordem as any).produtos_utilizados?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start bg-blue-50 p-3 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.produto?.nome || 'Produto não encontrado'}</p>
                    <p className="text-sm text-gray-600">{item.produto?.descricao || 'Sem descrição'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Categoria: {item.produto?.categoria || 'N/A'} | Qtd: {item.quantidade}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>Unit: {formatCurrency(item.valor_unitario)}</p>
                    <p className="font-medium">Total: {formatCurrency(item.valor_total)}</p>
                  </div>
                </div>
              ))}

              {/* Peças */}
              {(ordem as any).pecas_utilizadas?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start bg-orange-50 p-3 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.nome}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Categoria: Peça | Qtd: {item.quantidade}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>Unit: {formatCurrency(item.valor_unitario)}</p>
                    <p className="font-medium">Total: {formatCurrency(item.valor_total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Valores */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">VALORES</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><strong>Mão de Obra:</strong> {formatCurrency(ordem.valor_mao_obra)}</p>
              <p><strong>Valor Total:</strong> {formatCurrency(ordem.valor_total)}</p>
              {ordem.desconto && ordem.desconto > 0 && (
                <p><strong>Desconto:</strong> {formatCurrency(ordem.desconto)}</p>
              )}
              {ordem.acrescimo && ordem.acrescimo > 0 && (
                <p><strong>Acréscimo:</strong> {formatCurrency(ordem.acrescimo)}</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-lg"><strong>VALOR FINAL:</strong> <span className="text-green-600">{formatCurrency(ordem.valor_final || ordem.valor_total)}</span></p>
              {ordem.forma_pagamento && (
                <p><strong>Forma Pagamento:</strong> {ordem.forma_pagamento.replace('_', ' ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Observações */}
        {ordem.observacoes_internas && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">OBSERVAÇÕES</h3>
            <p className="text-sm">{ordem.observacoes_internas}</p>
          </div>
        )}

        {/* Assinaturas */}
        <div className="mt-12 pt-6 border-t">
          <div className="grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2">
                <p className="text-sm font-medium">ASSINATURA DO CLIENTE</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2">
                <p className="text-sm font-medium">ASSINATURA DO TÉCNICO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Esta ordem de serviço é válida mediante apresentação e conferência dos dados.</p>
        </div>
      </div>
    );
  }
);

OrderPrint.displayName = 'OrderPrint';