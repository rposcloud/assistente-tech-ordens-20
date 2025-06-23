
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
      <div ref={ref} className="print-container">
        <style>{`
          @media print {
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
            }
            
            .print-container {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 15mm;
              background: white;
              page-break-after: always;
            }
            
            .print-header {
              border-bottom: 3px solid #2563eb;
              margin-bottom: 20px;
              padding-bottom: 15px;
            }
            
            .print-section {
              break-inside: avoid;
              margin-bottom: 15px;
              page-break-inside: avoid;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            
            .print-table th,
            .print-table td {
              border: 1px solid #000;
              padding: 6px;
              text-align: left;
            }
            
            .print-table th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            
            .print-signature {
              position: absolute;
              bottom: 20mm;
              left: 15mm;
              right: 15mm;
              width: calc(100% - 30mm);
            }
            
            .signature-line {
              border-top: 2px solid #000;
              margin-top: 40px;
              padding-top: 8px;
              text-align: center;
            }
            
            .no-print {
              display: none !important;
            }
            
            .text-blue-600 {
              color: #2563eb !important;
            }
            
            .bg-blue-600 {
              background-color: #2563eb !important;
              color: white !important;
            }
            
            .bg-gray-50,
            .bg-blue-50,
            .bg-green-50,
            .bg-yellow-50,
            .bg-purple-50 {
              background-color: #f9f9f9 !important;
            }
            
            .rounded-lg,
            .rounded {
              border-radius: 0 !important;
            }
          }
          
          @page {
            size: A4;
            margin: 0;
          }
        `}</style>
        
        <div className="print-page">
          {/* Cabeçalho */}
          <div className="print-header">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">TechService</h1>
                <p className="text-lg text-gray-600 font-medium">Sistema de Gerenciamento Técnico</p>
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>📍 Rua da Tecnologia, 123 - Centro - São Paulo/SP - CEP: 01234-567</p>
                  <p>📞 (11) 9999-9999 | ✉️ contato@techservice.com</p>
                  <p>🌐 www.techservice.com | CNPJ: 12.345.678/0001-90</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-600 text-white px-6 py-4 rounded-lg inline-block">
                  <div className="text-2xl font-bold">OS #{ordem.numero}</div>
                  <div className="text-sm opacity-90">Ordem de Serviço</div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="font-semibold">Data: {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}</div>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-200">
                      {statusTexts[ordem.status]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Cliente */}
          <div className="print-section mb-6">
            <div className="bg-gray-50 p-4 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold text-gray-800 mb-3">👤 Dados do Cliente</h2>
              <div className="grid grid-cols-2 gap-4">
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
          <div className="print-section mb-6">
            <div className="bg-blue-50 p-4 border-l-4 border-blue-600">
              <h2 className="text-lg font-bold text-gray-800 mb-3">🔧 Informações do Equipamento</h2>
              <div className="grid grid-cols-2 gap-4">
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
                  <div className="mt-2 p-3 bg-white border text-sm">
                    {ordem.defeitoRelatado}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Diagnóstico */}
          {(ordem.diagnosticoTecnico || ordem.solucaoAplicada) && (
            <div className="print-section mb-6">
              <div className="bg-green-50 p-4 border-l-4 border-green-500">
                <h2 className="text-lg font-bold text-gray-800 mb-3">🔍 Diagnóstico e Solução</h2>
                {ordem.diagnosticoTecnico && (
                  <div className="mb-3">
                    <div className="font-semibold mb-2">Diagnóstico Técnico:</div>
                    <div className="p-3 bg-white border text-sm">
                      {ordem.diagnosticoTecnico}
                    </div>
                  </div>
                )}
                {ordem.solucaoAplicada && (
                  <div>
                    <div className="font-semibold mb-2">Solução Aplicada:</div>
                    <div className="p-3 bg-white border text-sm">
                      {ordem.solucaoAplicada}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção Financeira */}
          <div className="print-section mb-6">
            <div className="bg-yellow-50 p-4 border-l-4 border-yellow-500">
              <h2 className="text-lg font-bold text-gray-800 mb-3">💰 Detalhamento Financeiro</h2>
              
              {ordem.pecasUtilizadas && ordem.pecasUtilizadas.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-3">Peças e Componentes Utilizados:</h3>
                  <table className="print-table">
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th style={{width: '60px', textAlign: 'center'}}>Qtd</th>
                        <th style={{width: '80px', textAlign: 'right'}}>Valor Unit.</th>
                        <th style={{width: '80px', textAlign: 'right'}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordem.pecasUtilizadas.map((peca) => (
                        <tr key={peca.id}>
                          <td>{peca.nome}</td>
                          <td style={{textAlign: 'center'}}>{peca.quantidade}</td>
                          <td style={{textAlign: 'right'}}>{formatCurrency(peca.valorUnitario)}</td>
                          <td style={{textAlign: 'right', fontWeight: 'bold'}}>{formatCurrency(peca.valorTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-white p-4 border-2 border-gray-300">
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
                  <hr className="border-gray-400" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">VALOR TOTAL:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(ordem.valorTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Prazos */}
          <div className="print-section mb-8">
            <div className="bg-purple-50 p-4 border-l-4 border-purple-500">
              <h2 className="text-lg font-bold text-gray-800 mb-3">📅 Prazos e Garantia</h2>
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

          {/* Termos */}
          <div className="print-section mb-16">
            <div className="bg-gray-100 p-4">
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
                <div className="signature-line">
                  <p className="font-semibold">Assinatura do Cliente</p>
                  <p className="text-sm text-gray-600 mt-1">{cliente.nome}</p>
                  <p className="text-xs text-gray-500">CPF/CNPJ: {cliente.cpfCnpj}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="signature-line">
                  <p className="font-semibold">Técnico Responsável</p>
                  <p className="text-sm text-gray-600 mt-1">TechService Ltda.</p>
                  <p className="text-xs text-gray-500">CNPJ: 12.345.678/0001-90</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6 text-xs text-gray-500">
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
