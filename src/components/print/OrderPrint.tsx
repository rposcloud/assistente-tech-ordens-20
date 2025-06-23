
import React, { forwardRef } from 'react';
import { OrdemServico, Cliente } from '../../types';
import { formatCurrency } from '../../utils/masks';

interface OrderPrintProps {
  ordem: OrdemServico;
  cliente: Cliente;
}

export const OrderPrint = forwardRef<HTMLDivElement, OrderPrintProps>(
  ({ ordem, cliente }, ref) => {
    const statusTexts = {
      aguardando_diagnostico: 'Aguardando Diagnóstico',
      aguardando_aprovacao: 'Aguardando Aprovação',
      aguardando_pecas: 'Aguardando Peças',
      em_reparo: 'Em Reparo',
      pronto_entrega: 'Pronto para Entrega',
      entregue: 'Entregue'
    };

    const tipoEquipamentoTexts = {
      smartphone: 'Smartphone',
      notebook: 'Notebook',
      desktop: 'Desktop',
      tablet: 'Tablet',
      outros: 'Outros'
    };

    return (
      <div ref={ref} className="max-w-4xl mx-auto bg-white p-8 print:p-4">
        {/* Cabeçalho */}
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">TechService</h1>
          <p className="text-gray-600">Sistema de Gerenciamento de Ordens de Serviço</p>
          <p className="text-sm text-gray-500 mt-2">
            Rua da Tecnologia, 123 - Centro - São Paulo/SP - CEP: 01234-567
          </p>
          <p className="text-sm text-gray-500">
            Tel: (11) 9999-9999 - Email: contato@techservice.com
          </p>
        </div>

        {/* Informações da Ordem */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Dados da Ordem</h2>
            <div className="space-y-2">
              <p><strong>Número:</strong> #{ordem.numero}</p>
              <p><strong>Data de Abertura:</strong> {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}</p>
              <p><strong>Status:</strong> {statusTexts[ordem.status]}</p>
              {ordem.prazoEntrega && (
                <p><strong>Prazo de Entrega:</strong> {new Date(ordem.prazoEntrega).toLocaleDateString('pt-BR')}</p>
              )}
              <p><strong>Garantia:</strong> {ordem.garantia} dias</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Dados do Cliente</h2>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {cliente.nome}</p>
              <p><strong>Email:</strong> {cliente.email}</p>
              <p><strong>Telefone:</strong> {cliente.telefone}</p>
              <p><strong>CPF/CNPJ:</strong> {cliente.cpfCnpj}</p>
              <p><strong>Endereço:</strong> {cliente.endereco}, {cliente.numero}</p>
              <p>{cliente.bairro} - {cliente.cidade}/{cliente.estado}</p>
              <p><strong>CEP:</strong> {cliente.cep}</p>
            </div>
          </div>
        </div>

        {/* Informações do Equipamento */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Equipamento</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Tipo:</strong> {tipoEquipamentoTexts[ordem.tipoEquipamento]}</p>
              <p><strong>Marca:</strong> {ordem.marca}</p>
              <p><strong>Modelo:</strong> {ordem.modelo}</p>
              {ordem.numeroSerie && (
                <p><strong>Número de Série:</strong> {ordem.numeroSerie}</p>
              )}
            </div>
            <div>
              <p><strong>Defeito Relatado:</strong></p>
              <p className="text-sm bg-gray-100 p-2 rounded">{ordem.defeitoRelatado}</p>
            </div>
          </div>
        </div>

        {/* Diagnóstico e Solução */}
        {(ordem.diagnosticoTecnico || ordem.solucaoAplicada) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Diagnóstico e Solução</h2>
            {ordem.diagnosticoTecnico && (
              <div className="mb-4">
                <p><strong>Diagnóstico Técnico:</strong></p>
                <p className="text-sm bg-gray-100 p-2 rounded">{ordem.diagnosticoTecnico}</p>
              </div>
            )}
            {ordem.solucaoAplicada && (
              <div>
                <p><strong>Solução Aplicada:</strong></p>
                <p className="text-sm bg-gray-100 p-2 rounded">{ordem.solucaoAplicada}</p>
              </div>
            )}
          </div>
        )}

        {/* Peças e Valores */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Valores</h2>
          
          {ordem.pecasUtilizadas && ordem.pecasUtilizadas.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Peças Utilizadas:</h3>
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left">Peça</th>
                    <th className="border border-gray-300 px-2 py-1 text-center">Qtd</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Valor Unit.</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ordem.pecasUtilizadas.map((peca) => (
                    <tr key={peca.id}>
                      <td className="border border-gray-300 px-2 py-1">{peca.nome}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{peca.quantidade}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(peca.valorUnitario)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(peca.valorTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            <div></div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Mão de Obra:</span>
                <span>{formatCurrency(ordem.valorMaoObra)}</span>
              </div>
              {ordem.pecasUtilizadas && (
                <div className="flex justify-between">
                  <span>Peças:</span>
                  <span>{formatCurrency(ordem.pecasUtilizadas.reduce((total, peca) => total + peca.valorTotal, 0))}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(ordem.valorTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Termos e Assinatura */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-medium mb-2">Termos de Garantia:</h3>
          <p className="text-sm text-gray-600 mb-6">
            Este serviço possui garantia de {ordem.garantia} dias a partir da data de entrega, 
            cobrindo apenas defeitos relacionados ao serviço executado. A garantia não cobre 
            danos por mau uso, acidentes ou desgaste natural.
          </p>

          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="border-t border-gray-400 mt-16 pt-2">
                <p className="text-sm">Assinatura do Cliente</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 mt-16 pt-2">
                <p className="text-sm">Assinatura do Técnico</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OrderPrint.displayName = 'OrderPrint';
