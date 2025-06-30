import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VisualizacaoOSProps {
  isOpen: boolean;
  onClose: () => void;
  ordem: any;
}

const statusLabels = {
  aguardando_diagnostico: 'Aguardando Diagnóstico',
  aguardando_aprovacao: 'Aguardando Aprovação',
  aguardando_pecas: 'Aguardando Peças',
  em_reparo: 'Em Reparo',
  pronto_entrega: 'Pronto para Entrega',
  entregue: 'Entregue'
};

const prioridadeLabels = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente'
};

export const VisualizacaoOS = ({ isOpen, onClose, ordem }: VisualizacaoOSProps) => {
  if (!ordem) return null;

  const formatCurrency = (value: any) => {
    if (!value) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Não informado';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ordem de Serviço #${ordem.numero}</title>
          <style>
            @media print {
              @page { size: A4; margin: 1cm; }
              body { font-size: 12px; }
            }

            body {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              color: #000;
              margin: 0;
              padding: 20px;
            }

            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }

            .empresa-info {
              text-align: left;
              margin-bottom: 15px;
              font-size: 14px;
            }

            .section {
              margin-bottom: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }

            .section-header {
              background: #f5f5f5;
              padding: 8px 12px;
              font-weight: bold;
              border-bottom: 1px solid #ddd;
            }

            .section-content {
              padding: 12px;
            }

            .row {
              display: flex;
              margin-bottom: 8px;
            }

            .col {
              flex: 1;
              padding-right: 15px;
            }

            .label {
              font-weight: bold;
              color: #555;
            }

            .value {
              color: #000;
              margin-top: 2px;
            }

            .produto-item {
              border-left: 3px solid #3b82f6;
              padding-left: 10px;
              margin-bottom: 10px;
              background: #f8fafc;
              padding: 8px;
            }

            .peca-item {
              border-left: 3px solid #f97316;
              padding-left: 10px;
              margin-bottom: 10px;
              background: #fef7f0;
              padding: 8px;
            }

            .signature-area {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }

            .signature {
              text-align: center;
              width: 200px;
            }

            .signature-line {
              border-top: 1px solid #000;
              margin-top: 40px;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${ordem.empresa ? `
              <div class="empresa-info">
                <strong>${ordem.empresa.empresa || ordem.empresa.nome_completo}</strong><br>
                ${ordem.empresa.cnpj ? `CNPJ: ${ordem.empresa.cnpj}<br>` : ''}
                ${ordem.empresa.telefone ? `Tel: ${ordem.empresa.telefone}<br>` : ''}
                ${ordem.empresa.email_empresa ? `Email: ${ordem.empresa.email_empresa}<br>` : ''}
                ${ordem.empresa.endereco ? `${ordem.empresa.endereco}${ordem.empresa.numero ? ', ' + ordem.empresa.numero : ''}<br>` : ''}
                ${ordem.empresa.cidade && ordem.empresa.estado ? `${ordem.empresa.cidade}/${ordem.empresa.estado}` : ''}
              </div>
            ` : ''}
            <h1>ORDEM DE SERVIÇO</h1>
            <h2>#${ordem.numero}</h2>
          </div>

          <div class="section">
            <div class="section-header">Informações da Ordem</div>
            <div class="section-content">
              <div class="row">
                <div class="col">
                  <div class="label">Status:</div>
                  <div class="value">${statusLabels[ordem.status as keyof typeof statusLabels]}</div>
                </div>
                <div class="col">
                  <div class="label">Prioridade:</div>
                  <div class="value">${prioridadeLabels[ordem.prioridade as keyof typeof prioridadeLabels]}</div>
                </div>
                <div class="col">
                  <div class="label">Data de Abertura:</div>
                  <div class="value">${formatDate(ordem.data_abertura)}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">Dados do Cliente</div>
            <div class="section-content">
              <div class="row">
                <div class="col">
                  <div class="label">Nome:</div>
                  <div class="value">${ordem.clientes?.nome || 'N/A'}</div>
                </div>
                <div class="col">
                  <div class="label">Telefone:</div>
                  <div class="value">${ordem.clientes?.telefone || 'N/A'}</div>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <div class="label">Email:</div>
                  <div class="value">${ordem.clientes?.email || 'N/A'}</div>
                </div>
                <div class="col">
                  <div class="label">CPF/CNPJ:</div>
                  <div class="value">${ordem.clientes?.cpf_cnpj || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">Equipamento</div>
            <div class="section-content">
              <div class="row">
                <div class="col">
                  <div class="label">Tipo:</div>
                  <div class="value">${ordem.tipo_equipamento}</div>
                </div>
                <div class="col">
                  <div class="label">Marca:</div>
                  <div class="value">${ordem.marca || 'N/A'}</div>
                </div>
                <div class="col">
                  <div class="label">Modelo:</div>
                  <div class="value">${ordem.modelo || 'N/A'}</div>
                </div>
              </div>
              ${ordem.numero_serie ? `
                <div class="row">
                  <div class="col">
                    <div class="label">Número de Série:</div>
                    <div class="value">${ordem.numero_serie}</div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-header">Problema e Diagnóstico</div>
            <div class="section-content">
              <div class="row">
                <div class="col">
                  <div class="label">Defeito Relatado:</div>
                  <div class="value">${ordem.defeito_relatado || 'N/A'}</div>
                </div>
              </div>
              ${ordem.diagnostico_tecnico ? `
                <div class="row">
                  <div class="col">
                    <div class="label">Diagnóstico Técnico:</div>
                    <div class="value">${ordem.diagnostico_tecnico}</div>
                  </div>
                </div>
              ` : ''}
              ${ordem.solucao_aplicada ? `
                <div class="row">
                  <div class="col">
                    <div class="label">Solução Aplicada:</div>
                    <div class="value">${ordem.solucao_aplicada}</div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          ${(ordem.produtos_utilizados?.length > 0 || ordem.pecas_utilizadas?.length > 0) ? `
            <div class="section">
              <div class="section-header">Produtos e Serviços Utilizados</div>
              <div class="section-content">
                ${ordem.produtos_utilizados?.map((item: any) => `
                  <div class="produto-item">
                    <div class="label">${item.produto?.nome || 'Produto não encontrado'}</div>
                    <div class="value">${item.produto?.descricao || 'Sem descrição'}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                      Categoria: ${item.produto?.categoria || 'N/A'} | 
                      Qtd: ${item.quantidade} | 
                      Unit: ${formatCurrency(item.valor_unitario)} | 
                      Total: ${formatCurrency(item.valor_total)}
                    </div>
                  </div>
                `).join('') || ''}
                ${ordem.pecas_utilizadas?.map((item: any) => `
                  <div class="peca-item">
                    <div class="label">${item.nome}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                      Categoria: Peça | 
                      Qtd: ${item.quantidade} | 
                      Unit: ${formatCurrency(item.valor_unitario)} | 
                      Total: ${formatCurrency(item.valor_total)}
                    </div>
                  </div>
                `).join('') || ''}
              </div>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-header">Valores</div>
            <div class="section-content">
              <div class="row">
                <div class="col">
                  <div class="label">Mão de Obra:</div>
                  <div class="value">${formatCurrency(ordem.valor_mao_obra)}</div>
                </div>
                <div class="col">
                  <div class="label">Produtos/Serviços:</div>
                  <div class="value">${formatCurrency(ordem.valor_total)}</div>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <div class="label">Desconto:</div>
                  <div class="value">${formatCurrency(ordem.desconto)}</div>
                </div>
                <div class="col">
                  <div class="label">Valor Final:</div>
                  <div class="value" style="font-weight: bold; font-size: 16px;">${formatCurrency(ordem.valor_final)}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="signature-area">
            <div class="signature">
              <div class="signature-line">Cliente</div>
            </div>
            <div class="signature">
              <div class="signature-line">Técnico</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #666;">
            Documento gerado em ${formatDate(new Date())}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              Ordem de Serviço #{ordem.numero}
            </DialogTitle>
            <div className="flex gap-2">
              <Button onClick={handlePrint} size="sm" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button onClick={onClose} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                <Badge variant="secondary" className="text-sm">
                  {statusLabels[ordem.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Prioridade</label>
              <p className="mt-1 text-sm">{prioridadeLabels[ordem.prioridade as keyof typeof prioridadeLabels]}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Data de Abertura</label>
              <p className="mt-1 text-sm">{formatDate(ordem.data_abertura)}</p>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <p className="mt-1">{ordem.clientes?.nome || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{ordem.clientes?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Telefone</label>
                <p className="mt-1">{ordem.clientes?.telefone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">CPF/CNPJ</label>
                <p className="mt-1">{ordem.clientes?.cpf_cnpj || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Equipamento */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Equipamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo</label>
                <p className="mt-1 capitalize">{ordem.tipo_equipamento}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Marca</label>
                <p className="mt-1">{ordem.marca || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Modelo</label>
                <p className="mt-1">{ordem.modelo || 'N/A'}</p>
              </div>
              {ordem.numero_serie && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Número de Série</label>
                  <p className="mt-1">{ordem.numero_serie}</p>
                </div>
              )}
            </div>
          </div>

          {/* Problema e Diagnóstico */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Problema e Diagnóstico</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Defeito Relatado</label>
                <p className="mt-1">{ordem.defeito_relatado || 'N/A'}</p>
              </div>
              {ordem.diagnostico_tecnico && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Diagnóstico Técnico</label>
                  <p className="mt-1">{ordem.diagnostico_tecnico}</p>
                </div>
              )}
              {ordem.solucao_aplicada && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Solução Aplicada</label>
                  <p className="mt-1">{ordem.solucao_aplicada}</p>
                </div>
              )}
            </div>
          </div>

          {/* Produtos e Serviços Utilizados */}
          {(ordem.produtos_utilizados?.length > 0 || ordem.pecas_utilizadas?.length > 0) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Produtos e Serviços Utilizados</h3>
              <div className="space-y-4">
                {/* Produtos */}
                {ordem.produtos_utilizados?.map((item: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.produto?.nome || 'Produto não encontrado'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.produto?.descricao || 'Sem descrição'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Categoria: <strong>{item.produto?.categoria || 'N/A'}</strong></span>
                          <span>Quantidade: <strong>{item.quantidade}</strong></span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">Unit: R$ {parseFloat(item.valor_unitario || 0).toFixed(2).replace('.', ',')}</div>
                        <div className="font-medium text-gray-900">Total: R$ {parseFloat(item.valor_total || 0).toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Peças */}
                {ordem.pecas_utilizadas?.map((item: any, index: number) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded-r">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.nome}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Categoria: <strong>Peça</strong></span>
                          <span>Quantidade: <strong>{item.quantidade}</strong></span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">Unit: R$ {parseFloat(item.valor_unitario || 0).toFixed(2).replace('.', ',')}</div>
                        <div className="font-medium text-gray-900">Total: R$ {parseFloat(item.valor_total || 0).toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valores */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Mão de Obra</label>
                <p className="mt-1 text-lg">{formatCurrency(ordem.valor_mao_obra)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Produtos/Serviços</label>
                <p className="mt-1 text-lg">{formatCurrency(ordem.valor_total)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Desconto</label>
                <p className="mt-1 text-lg">{formatCurrency(ordem.desconto)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Valor Final</label>
                <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(ordem.valor_final)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};