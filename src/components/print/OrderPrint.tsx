
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

    const valorPecas = (ordem.pecasUtilizadas || []).reduce((total, peca) => total + peca.valorTotal, 0);

    return (
      <div ref={ref} className="max-w-4xl mx-auto bg-white">
        <style>{`
          @media print {
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            .print-page { 
              width: 210mm; 
              min-height: 297mm; 
              margin: 0; 
              padding: 15mm;
              box-sizing: border-box;
            }
            .no-print { display: none !important; }
            .print-header { border-bottom: 3px solid #2563eb; margin-bottom: 20px; }
            .print-section { break-inside: avoid; margin-bottom: 15px; }
            .print-table { width: 100%; border-collapse: collapse; }
            .print-table th, .print-table td { 
              border: 1px solid #d1d5db; 
              padding: 8px; 
              text-align: left; 
              font-size: 12px;
            }
            .print-signature { 
              position: fixed; 
              bottom: 30mm; 
              left: 15mm; 
              right: 15mm; 
            }
          }
        `}</style>
        
        <div className="print-page p-8">
          {/* Cabeçalho Profissional */}
          <div className="print-header pb-6 mb-8 border-b-4 border-blue-600">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-blue-600 mb-2">TechService</h1>
                <p className="text-lg text-gray-600 font-medium">Sistema de Gerenciamento Técnico</p>
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>📍 Rua da Tecnologia, 123 - Centro - São Paulo/SP - CEP: 01234-567</p>
                  <p>📞 (11) 9999-9999 | ✉️ contato@techservice.com</p>
                  <p>🌐 www.techservice.com | CNPJ: 12.345.678/0001-90</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-600 text-white px-6 py-4 rounded-lg">
                  <div className="text-2xl font-bold">OS #{ordem.numero}</div>
                  <div className="text-sm opacity-90">Ordem de Serviço</div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="font-semibold">Data: {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                    ordem.status === 'entregue' ? 'bg-green-100 text-green-800' :
                    ordem.status === 'pronto_entrega' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {statusTexts[ordem.status]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Cliente */}
          <div className="print-section mb-8">
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                👤 Dados do Cliente
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div><strong>Nome:</strong> {cliente.nome}</div>
                  <div><strong>Email:</strong> {cliente.email}</div>
                  <div><strong>Telefone:</strong> {cliente.telefone}</div>
                  <div><strong>CPF/CNPJ:</strong> {cliente.cpfCnpj}</div>
                </div>
                <div className="space-y-2">
                  <div><strong>Endereço:</strong></div>
                  <div className="pl-4 text-sm text-gray-700">
                    {cliente.endereco}, {cliente.numero}<br/>
                    {cliente.bairro} - {cliente.cidade}/{cliente.estado}<br/>
                    <strong>CEP:</strong> {cliente.cep}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Equipamento */}
          <div className="print-section mb-8">
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🔧 Informações do Equipamento
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div><strong>Tipo:</strong> {tipoEquipamentoTexts[ordem.tipoEquipamento]}</div>
                  <div><strong>Marca:</strong> {ordem.marca}</div>
                  <div><strong>Modelo:</strong> {ordem.modelo}</div>
                  {ordem.numeroSerie && (
                    <div><strong>Número de Série:</strong> {ordem.numeroSerie}</div>
                  )}
                </div>
                <div>
                  <div><strong>Defeito Relatado:</strong></div>
                  <div className="mt-2 p-3 bg-white border rounded text-sm">
                    {ordem.defeitoRelatado}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Diagnóstico */}
          {(ordem.diagnosticoTecnico || ordem.solucaoAplicada) && (
            <div className="print-section mb-8">
              <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  🔍 Diagnóstico e Solução
                </h2>
                {ordem.diagnosticoTecnico && (
                  <div className="mb-4">
                    <div className="font-semibold mb-2">Diagnóstico Técnico:</div>
                    <div className="p-3 bg-white border rounded text-sm">
                      {ordem.diagnosticoTecnico}
                    </div>
                  </div>
                )}
                {ordem.solucaoAplicada && (
                  <div>
                    <div className="font-semibold mb-2">Solução Aplicada:</div>
                    <div className="p-3 bg-white border rounded text-sm">
                      {ordem.solucaoAplicada}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção Financeira */}
          <div className="print-section mb-8">
            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                💰 Detalhamento Financeiro
              </h2>
              
              {ordem.pecasUtilizadas && ordem.pecasUtilizadas.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Peças e Componentes Utilizados:</h3>
                  <table className="print-table w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Descrição</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Qtd</th>
                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Valor Unit.</th>
                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordem.pecasUtilizadas.map((peca) => (
                        <tr key={peca.id}>
                          <td className="border border-gray-300 px-3 py-2">{peca.nome}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{peca.quantidade}</td>
                          <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(peca.valorUnitario)}</td>
                          <td className="border border-gray-300 px-3 py-2 text-right font-semibold">{formatCurrency(peca.valorTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Mão de Obra:</span>
                    <span className="font-semibold">{formatCurrency(ordem.valorMaoObra)}</span>
                  </div>
                  {valorPecas > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">Peças e Componentes:</span>
                      <span className="font-semibold">{formatCurrency(valorPecas)}</span>
                    </div>
                  )}
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">VALOR TOTAL:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(ordem.valorTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Prazos e Garantia */}
          <div className="print-section mb-8">
            <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                📅 Prazos e Garantia
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-600">Data de Abertura</div>
                  <div className="text-lg font-bold">{new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}</div>
                </div>
                {ordem.prazoEntrega && (
                  <div className="text-center">
                    <div className="font-semibold text-gray-600">Prazo de Entrega</div>
                    <div className="text-lg font-bold">{new Date(ordem.prazoEntrega).toLocaleDateString('pt-BR')}</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="font-semibold text-gray-600">Garantia</div>
                  <div className="text-lg font-bold">{ordem.garantia} dias</div>
                </div>
              </div>
            </div>
          </div>

          {/* Termos e Condições */}
          <div className="print-section mb-12">
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="font-bold mb-3 text-gray-800">📋 Termos e Condições de Garantia:</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• Este serviço possui garantia de <strong>{ordem.garantia} dias</strong> a partir da data de entrega, cobrindo exclusivamente defeitos relacionados ao serviço executado.</p>
                <p>• A garantia NÃO cobre danos causados por: mau uso, quedas, contato com líquidos, exposição a temperaturas extremas, ou desgaste natural dos componentes.</p>
                <p>• Para validar a garantia, é obrigatório apresentar esta ordem de serviço.</p>
                <p>• Equipamentos não retirados em até 90 dias poderão ser descartados sem aviso prévio.</p>
                <p>• O cliente declara estar ciente dos termos acima e concorda com os valores apresentados.</p>
              </div>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="print-signature">
            <div className="grid grid-cols-2 gap-12">
              <div className="text-center">
                <div className="border-t-2 border-gray-400 mt-16 pt-2">
                  <p className="font-semibold">Assinatura do Cliente</p>
                  <p className="text-sm text-gray-600 mt-1">{cliente.nome}</p>
                  <p className="text-xs text-gray-500">CPF/CNPJ: {cliente.cpfCnpj}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 mt-16 pt-2">
                  <p className="font-semibold">Técnico Responsável</p>
                  <p className="text-sm text-gray-600 mt-1">TechService Ltda.</p>
                  <p className="text-xs text-gray-500">CNPJ: 12.345.678/0001-90</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8 text-xs text-gray-500">
              <p>Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              <p>TechService - Sistema de Gerenciamento Técnico | www.techservice.com</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OrderPrint.displayName = 'OrderPrint';
