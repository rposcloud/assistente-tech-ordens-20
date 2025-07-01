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
        {/* Cabeçalho da Empresa - dados completos */}
        <div className="border-b-2 border-blue-600 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-blue-600 mb-3">
                {companyProfile?.empresa || 'TechService'}
              </h1>
              <div className="text-base text-gray-700 space-y-1">
                {companyProfile?.nome_completo && (
                  <p><strong>Responsável:</strong> {companyProfile.nome_completo}</p>
                )}
                {companyProfile?.cnpj && (
                  <p><strong>CNPJ:</strong> {companyProfile.cnpj}</p>
                )}
                {companyProfile?.inscricao_estadual && (
                  <p><strong>IE:</strong> {companyProfile.inscricao_estadual}</p>
                )}
              </div>
            </div>
            <div className="text-right text-base text-gray-700 space-y-1">
              {companyProfile?.endereco && (
                <p>{companyProfile.endereco}, {companyProfile.numero || 'S/N'}</p>
              )}
              {companyProfile?.bairro && (
                <p>{companyProfile.bairro} - {companyProfile.cep}</p>
              )}
              {companyProfile?.cidade && (
                <p>{companyProfile.cidade}/{companyProfile.estado}</p>
              )}
              {companyProfile?.telefone && (
                <p><strong>Tel:</strong> {companyProfile.telefone}</p>
              )}
              {companyProfile?.email_empresa && (
                <p><strong>Email:</strong> {companyProfile.email_empresa}</p>
              )}
              {companyProfile?.site && (
                <p><strong>Site:</strong> {companyProfile.site}</p>
              )}
            </div>
          </div>
        </div>

        {/* Título da OS */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">ORDEM DE SERVIÇO</h2>
          <p className="text-xl text-gray-600">Nº {ordem.numero}</p>
        </div>

        {/* Informações do Cliente */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border rounded-lg p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">DADOS DO CLIENTE</h3>
            <div className="space-y-3 text-base">
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

          <div className="border rounded-lg p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">DADOS DA ORDEM</h3>
            <div className="space-y-3 text-base">
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
        <div className="border rounded-lg p-5 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">EQUIPAMENTO</h3>
          <div className="grid grid-cols-2 gap-4 text-base">
            <p><strong>Tipo:</strong> {ordem.tipo_equipamento}</p>
            <p><strong>Marca/Modelo:</strong> {ordem.marca} {ordem.modelo}</p>
            {ordem.numero_serie && <p><strong>Nº Série:</strong> {ordem.numero_serie}</p>}
            {ordem.senha_equipamento && <p><strong>Senha:</strong> {ordem.senha_equipamento}</p>}
          </div>
          {ordem.acessorios && (
            <div className="mt-4">
              <p className="text-base"><strong>Acessórios:</strong> {ordem.acessorios}</p>
            </div>
          )}
          {ordem.condicoes_equipamento && (
            <div className="mt-4">
              <p className="text-base"><strong>Condições:</strong> {ordem.condicoes_equipamento}</p>
            </div>
          )}
        </div>

        {/* Defeito e Diagnóstico */}
        <div className="space-y-6 mb-8">
          <div className="border rounded-lg p-5">
            <h4 className="text-lg font-bold text-gray-800 mb-3">DEFEITO RELATADO</h4>
            <p className="text-base">{ordem.defeito_relatado}</p>
          </div>

          {ordem.diagnostico_tecnico && (
            <div className="border rounded-lg p-5">
              <h4 className="text-lg font-bold text-gray-800 mb-3">DIAGNÓSTICO TÉCNICO</h4>
              <p className="text-base">{ordem.diagnostico_tecnico}</p>
            </div>
          )}

          {ordem.solucao_aplicada && (
            <div className="border rounded-lg p-5">
              <h4 className="text-lg font-bold text-gray-800 mb-3">SOLUÇÃO APLICADA</h4>
              <p className="text-base">{ordem.solucao_aplicada}</p>
            </div>
          )}
        </div>

        {/* Produtos e Serviços Utilizados */}
        {((ordem as any).produtos_utilizados?.length > 0 || (ordem as any).pecas_utilizadas?.length > 0) && (
          <div className="border rounded-lg p-5 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">PRODUTOS E SERVIÇOS UTILIZADOS</h3>
            <div className="space-y-4">
              {/* Produtos */}
              {(ordem as any).produtos_utilizados?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start bg-blue-50 p-4 rounded">
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900">{item.produto?.nome || 'Produto não encontrado'}</p>
                    <p className="text-sm text-gray-600">{item.produto?.descricao || 'Sem descrição'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Categoria: {item.produto?.categoria || 'N/A'} | Qtd: {item.quantidade}
                    </p>
                  </div>
                  <div className="text-right text-base">
                    <p>Unit: {formatCurrency(item.valor_unitario)}</p>
                    <p className="font-medium">Total: {formatCurrency(item.valor_total)}</p>
                  </div>
                </div>
              ))}

              {/* Peças */}
              {(ordem as any).pecas_utilizadas?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start bg-orange-50 p-4 rounded">
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900">{item.nome}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Categoria: Peça | Qtd: {item.quantidade}
                    </p>
                  </div>
                  <div className="text-right text-base">
                    <p>Unit: {formatCurrency(item.valor_unitario)}</p>
                    <p className="font-medium">Total: {formatCurrency(item.valor_total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Valores */}
        <div className="border rounded-lg p-5 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">VALORES</h3>
          <div className="grid grid-cols-2 gap-6 text-base">
            <div className="space-y-3">
              <p><strong>Mão de Obra:</strong> {formatCurrency(ordem.valor_mao_obra)}</p>
              <p><strong>Valor Total:</strong> {formatCurrency(ordem.valor_total)}</p>
              {ordem.desconto && ordem.desconto > 0 && (
                <p><strong>Desconto:</strong> {formatCurrency(ordem.desconto)}</p>
              )}
              {ordem.acrescimo && ordem.acrescimo > 0 && (
                <p><strong>Acréscimo:</strong> {formatCurrency(ordem.acrescimo)}</p>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xl"><strong>VALOR FINAL:</strong> <span className="text-green-600">{formatCurrency(ordem.valor_final || ordem.valor_total)}</span></p>
              {ordem.forma_pagamento && (
                <p><strong>Forma Pagamento:</strong> {ordem.forma_pagamento.replace('_', ' ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Observações */}
        {ordem.observacoes_internas && (
          <div className="border rounded-lg p-5 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">OBSERVAÇÕES</h3>
            <p className="text-base">{ordem.observacoes_internas}</p>
          </div>
        )}

        {/* Assinaturas */}
        <div className="mt-16 pt-8 border-t">
          <div className="grid grid-cols-2 gap-16">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-3">
                <p className="text-base font-medium">ASSINATURA DO CLIENTE</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-3">
                <p className="text-base font-medium">ASSINATURA DO TÉCNICO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>Esta ordem de serviço é válida mediante apresentação e conferência dos dados.</p>
        </div>
      </div>
    );
  }
);

OrderPrint.displayName = 'OrderPrint';