import React, { forwardRef } from 'react';
import { OrdemServico, Cliente } from '../../types';
import { formatCurrency } from '../../utils/masks';

interface OrderPrintProps {
  ordem: OrdemServico;
  cliente: Cliente;
}

export const OrderPrint = forwardRef<HTMLDivElement, OrderPrintProps>(
  ({ ordem, cliente }, ref) => {
    // Early return if cliente is not available
    if (!cliente || !ordem) {
      return (
        <div ref={ref} className="print-container bg-white p-4 max-w-4xl mx-auto">
          <div className="text-center text-gray-500">
            Carregando informações da ordem de serviço...
          </div>
        </div>
      );
    }

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

    const formaPagamentoTexts = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      transferencia: 'Transferência',
      parcelado: 'Parcelado'
    };

    const valorPecas = (ordem.pecasUtilizadas || []).reduce((total, peca) => total + peca.valorTotal, 0);
    const valorFinalCalculado = ordem.valorFinal || ordem.valorTotal || 0;

    return (
      <div ref={ref} className="print-container bg-white p-4 max-w-4xl mx-auto">
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
              font-size: 11px;
              line-height: 1.3;
              color: #000;
            }
            
            .print-container {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 10mm;
              background: white;
              page-break-after: always;
            }
            
            .no-print {
              display: none !important;
            }
            
            .bg-gray-50, .bg-blue-50, .bg-green-50, .bg-yellow-50 {
              background-color: #f9f9f9 !important;
            }
            
            .text-blue-600 { color: #2563eb !important; }
            .bg-blue-600 { background-color: #2563eb !important; color: white !important; }
            .border-blue-500 { border-color: #3b82f6 !important; }
            .border-blue-600 { border-color: #2563eb !important; }
            .border-green-500 { border-color: #10b981 !important; }
            .border-yellow-500 { border-color: #f59e0b !important; }
            
            .rounded-lg, .rounded { border-radius: 0 !important; }
            
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .gap-4 { gap: 0.75rem; }
            .gap-6 { gap: 1rem; }
            
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-4 > * + * { margin-top: 0.75rem; }
            .space-y-6 > * + * { margin-top: 1rem; }
            
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.6rem; }
            .mb-4 { margin-bottom: 0.75rem; }
            .mb-6 { margin-bottom: 1rem; }
            .mb-8 { margin-bottom: 1.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 0.75rem; }
            .mt-6 { margin-top: 1rem; }
            
            .p-3 { padding: 0.5rem; }
            .p-4 { padding: 0.75rem; }
            .p-6 { padding: 1rem; }
            .px-3 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .px-4 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            
            .border { border-width: 1px; border-color: #d1d5db; }
            .border-2 { border-width: 2px; }
            .border-l-4 { border-left-width: 4px; }
            .border-t { border-top-width: 1px; }
            
            .text-xs { font-size: 0.7rem; }
            .text-sm { font-size: 0.8rem; }
            .text-lg { font-size: 1rem; }
            .text-xl { font-size: 1.1rem; }
            .text-2xl { font-size: 1.3rem; }
            .text-3xl { font-size: 1.5rem; }
            
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            
            .w-full { width: 100%; }
            .inline-block { display: inline-block; }
            
            .table { display: table; width: 100%; border-collapse: collapse; }
            .table th, .table td { 
              border: 1px solid #d1d5db; 
              padding: 6px; 
              text-align: left; 
              font-size: 0.8rem;
            }
            .table th { 
              background-color: #f3f4f6; 
              font-weight: bold; 
            }
            
            .signature-line {
              border-top: 2px solid #000;
              margin-top: 30px;
              padding-top: 6px;
              text-align: center;
            }
          }
          
          @page {
            size: A4;
            margin: 10mm;
          }
        `}</style>
        
        {/* Cabeçalho da Empresa */}
        <div className="border-b-2 border-blue-600 mb-4 pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 mb-2">TechService</h1>
              <p className="text-sm text-gray-600 font-medium">Sistema de Gerenciamento Técnico</p>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p>📍 Rua da Tecnologia, 123 - Centro - São Paulo/SP - CEP: 01234-567</p>
                <p>📞 (11) 9999-9999 | ✉️ contato@techservice.com</p>
                <p>🌐 www.techservice.com | CNPJ: 12.345.678/0001-90</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-600 text-white px-4 py-3 rounded-lg inline-block">
                <div className="text-xl font-bold">OS #{ordem.numero}</div>
                <div className="text-xs opacity-90">Ordem de Serviço</div>
              </div>
              <div className="mt-2 text-xs">
                <div><strong>Data:</strong> {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}</div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-1 bg-gray-200 text-xs font-semibold">
                    {statusTexts[ordem.status]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="mb-4">
          <div className="bg-gray-50 p-3 border-l-4 border-blue-500">
            <h2 className="text-lg font-bold mb-2">👤 Dados do Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div><strong>Nome:</strong> {cliente.nome}</div>
                <div><strong>Email:</strong> {cliente.email}</div>
                <div><strong>Telefone:</strong> {cliente.telefone}</div>
                <div><strong>CPF/CNPJ:</strong> {cliente.cpfCnpj}</div>
              </div>
              <div className="space-y-2">
                <div><strong>Endereço:</strong></div>
                <div className="text-sm text-gray-700 mt-1">
                  {cliente.endereco}, {cliente.numero}<br/>
                  {cliente.bairro} - {cliente.cidade}/{cliente.estado}<br/>
                  <strong>CEP:</strong> {cliente.cep}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Equipamento */}
        <div className="mb-4">
          <div className="bg-blue-50 p-3 border-l-4 border-blue-600">
            <h2 className="text-lg font-bold mb-2">🔧 Informações do Equipamento</h2>
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
                <div><strong>Defeito Relatado pelo Cliente:</strong></div>
                <div className="mt-1 p-2 bg-white border text-sm">
                  {ordem.defeitoRelatado}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico e Solução */}
        {(ordem.diagnosticoTecnico || ordem.solucaoAplicada) && (
          <div className="mb-4">
            <div className="bg-green-50 p-3 border-l-4 border-green-500">
              <h2 className="text-lg font-bold mb-2">🔍 Diagnóstico e Solução</h2>
              {ordem.diagnosticoTecnico && (
                <div className="mb-2">
                  <div className="font-semibold mb-1">Diagnóstico Técnico:</div>
                  <div className="p-2 bg-white border text-sm">
                    {ordem.diagnosticoTecnico}
                  </div>
                </div>
              )}
              {ordem.solucaoAplicada && (
                <div>
                  <div className="font-semibold mb-1">Solução Aplicada:</div>
                  <div className="p-2 bg-white border text-sm">
                    {ordem.solucaoAplicada}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações Internas (só para visualização) */}
        {ordem.observacoesInternas && (
          <div className="mb-4 no-print">
            <div className="bg-yellow-50 p-3 border-l-4 border-yellow-500">
              <h2 className="text-lg font-bold mb-2">📝 Observações Internas</h2>
              <div className="p-2 bg-white border text-sm">
                {ordem.observacoesInternas}
              </div>
            </div>
          </div>
        )}

        {/* Detalhamento Financeiro */}
        <div className="mb-4">
          <div className="bg-yellow-50 p-3 border-l-4 border-yellow-500">
            <h2 className="text-lg font-bold mb-2">💰 Detalhamento Financeiro</h2>
            
            {/* Peças utilizadas */}
            {ordem.pecasUtilizadas && ordem.pecasUtilizadas.length > 0 && (
              <div className="mb-3">
                <h3 className="font-semibold mb-2">Peças e Componentes Utilizados:</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th className="text-center" style={{width: '60px'}}>Qtd</th>
                      <th className="text-right" style={{width: '80px'}}>Valor Unit.</th>
                      <th className="text-right" style={{width: '80px'}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordem.pecasUtilizadas.map((peca) => (
                      <tr key={peca.id}>
                        <td>{peca.nome}</td>
                        <td className="text-center">{peca.quantidade}</td>
                        <td className="text-right">{formatCurrency(peca.valorUnitario)}</td>
                        <td className="text-right font-bold">{formatCurrency(peca.valorTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Resumo financeiro */}
            <div className="bg-white p-3 border-2">
              <div className="space-y-2">
                {valorPecas > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Peças e Componentes:</span>
                    <span className="font-semibold">{formatCurrency(valorPecas)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Mão de Obra:</span>
                  <span className="font-semibold">{formatCurrency(ordem.valorMaoObra || 0)}</span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">SUBTOTAL:</span>
                    <span className="font-bold">{formatCurrency(ordem.valorTotal || 0)}</span>
                  </div>
                </div>

                {ordem.desconto && ordem.desconto > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-medium">Desconto:</span>
                    <span className="font-semibold">-{formatCurrency(ordem.desconto)}</span>
                  </div>
                )}

                {ordem.acrescimo && ordem.acrescimo > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span className="font-medium">Acréscimo:</span>
                    <span className="font-semibold">+{formatCurrency(ordem.acrescimo)}</span>
                  </div>
                )}

                {(ordem.desconto || ordem.acrescimo) && (
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-xl font-bold text-blue-600">
                      <span>VALOR FINAL:</span>
                      <span>{formatCurrency(valorFinalCalculado)}</span>
                    </div>
                  </div>
                )}

                {!ordem.desconto && !ordem.acrescimo && (
                  <div className="flex justify-between text-xl font-bold text-blue-600">
                    <span>VALOR TOTAL:</span>
                    <span>{formatCurrency(ordem.valorTotal || 0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações de pagamento (se finalizadas) */}
            {ordem.finalizada && ordem.formaPagamento && (
              <div className="mt-3 bg-green-50 p-2 border">
                <h4 className="font-semibold mb-1">Informações de Pagamento:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Forma de Pagamento:</strong> {formaPagamentoTexts[ordem.formaPagamento]}
                  </div>
                  {ordem.dataPagamento && (
                    <div>
                      <strong>Data do Pagamento:</strong> {new Date(ordem.dataPagamento).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                {ordem.observacoesPagamento && (
                  <div className="mt-1">
                    <strong>Observações:</strong> {ordem.observacoesPagamento}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Prazos e Garantia */}
        <div className="mb-6">
          <div className="bg-gray-50 p-3 border-l-4 border-gray-500">
            <h2 className="text-lg font-bold mb-2">📅 Prazos e Garantia</h2>
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
            {ordem.dataConclusao && (
              <div className="mt-3 text-center">
                <div className="font-semibold text-gray-600">Data de Conclusão</div>
                <div className="text-lg font-bold text-green-600">{new Date(ordem.dataConclusao).toLocaleDateString('pt-BR')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Termos e Condições */}
        <div className="mb-12">
          <div className="bg-gray-100 p-3">
            <h3 className="font-bold mb-2">📋 Termos e Condições de Garantia:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Este serviço possui garantia de <strong>{ordem.garantia} dias</strong> a partir da data de entrega, cobrindo exclusivamente defeitos relacionados ao serviço executado.</p>
              <p>• A garantia NÃO cobre danos causados por: mau uso, quedas, contato com líquidos, exposição a temperaturas extremas, ou desgaste natural dos componentes.</p>
              <p>• Para validar a garantia, é obrigatório apresentar esta ordem de serviço.</p>
              <p>• Equipamentos não retirados em até 90 dias poderão ser descartados sem aviso prévio.</p>
              <p>• O cliente declara estar ciente dos termos acima e concorda com os valores apresentados.</p>
            </div>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="signature-line">
                <p className="font-semibold">Assinatura do Cliente</p>
                <p className="text-sm text-gray-600 mt-1">{cliente?.nome || 'Cliente'}</p>
                <p className="text-xs text-gray-500">CPF/CNPJ: {cliente?.cpfCnpj || 'N/A'}</p>
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
          
          <div className="text-center mt-4 text-xs text-gray-500">
            <p>Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            <p>TechService - Sistema de Gerenciamento Técnico | www.techservice.com</p>
          </div>
        </div>
      </div>
    );
  }
);

OrderPrint.displayName = 'OrderPrint';
