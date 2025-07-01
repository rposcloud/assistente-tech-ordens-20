import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { OrdemServico } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface OrdemDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordem: OrdemServico | null;
}

const statusLabels = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  aguardando_pecas: 'Aguardando Peças',
  pronta: 'Pronta',
  finalizada: 'Finalizada'
};

const statusColors = {
  aberta: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  aguardando_pecas: 'bg-orange-100 text-orange-800',
  pronta: 'bg-green-100 text-green-800',
  finalizada: 'bg-gray-100 text-gray-800'
};

const prioridadeLabels = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente'
};

const prioridadeColors = {
  baixa: 'bg-green-100 text-green-800',
  normal: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800'
};

export const OrdemDetalhesModal = ({ isOpen, onClose, ordem }: OrdemDetalhesModalProps) => {
  if (!ordem) return null;
  
  // Os dados já vêm completos da API principal
  const dadosOrdem = ordem as any;

  const formatDate = (date: string | null) => {
    if (!date) return 'Não informado';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: string | number | null) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  const handlePrint = () => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ordem de Serviço #${ordem.numero}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              margin: 0;
              padding: 20px;
              background: white;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            
            .header h2 {
              margin: 5px 0 0 0;
              font-size: 18px;
              color: #666;
            }
            
            .section {
              margin-bottom: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
              overflow: hidden;
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
            
            .col:last-child {
              padding-right: 0;
            }
            
            .label {
              font-weight: bold;
              color: #555;
              margin-bottom: 2px;
            }
            
            .value {
              color: #000;
            }
            
            .status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 3px;
              font-size: 11px;
              font-weight: bold;
            }
            
            .status-aguardando { background: #fff3cd; color: #856404; }
            .status-aprovacao { background: #d1ecf1; color: #0c5460; }
            .status-pecas { background: #ffeaa7; color: #6c5ce7; }
            .status-reparo { background: #e1d5f7; color: #6f42c1; }
            .status-pronto { background: #d4edda; color: #155724; }
            .status-entregue { background: #f8f9fa; color: #6c757d; }
            
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 11px;
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
            ${dadosOrdem.empresa ? `
              <div style="text-align: left; margin-bottom: 15px; font-size: 14px;">
                <strong>${dadosOrdem.empresa.empresa || dadosOrdem.empresa.nome_completo}</strong><br>
                ${dadosOrdem.empresa.cnpj ? `CNPJ: ${dadosOrdem.empresa.cnpj}<br>` : ''}
                ${dadosOrdem.empresa.telefone ? `Tel: ${dadosOrdem.empresa.telefone}<br>` : ''}
                ${dadosOrdem.empresa.email_empresa ? `Email: ${dadosOrdem.empresa.email_empresa}<br>` : ''}
                ${dadosOrdem.empresa.endereco ? `${dadosOrdem.empresa.endereco}${dadosOrdem.empresa.numero ? ', ' + dadosOrdem.empresa.numero : ''}<br>` : ''}
                ${dadosOrdem.empresa.cidade && dadosOrdem.empresa.estado ? `${dadosOrdem.empresa.cidade}/${dadosOrdem.empresa.estado}` : ''}
              </div>
            ` : ''}
            <h1>ORDEM DE SERVIÇO</h1>
            <h2>#${dadosOrdem.numero}</h2>
          </div>
          
          <div class="section">
            <div class="section-header">Informações da Ordem</div>
            <div class="section-content">
              <div class="row">
                <div class="col">
                  <div class="label">Status:</div>
                  <div class="value">
                    <span class="status status-${dadosOrdem.status}">${statusLabels[dadosOrdem.status as keyof typeof statusLabels]}</span>
                  </div>
                </div>
                <div class="col">
                  <div class="label">Prioridade:</div>
                  <div class="value">${prioridadeLabels[dadosOrdem.prioridade as keyof typeof prioridadeLabels]}</div>
                </div>
                <div class="col">
                  <div class="label">Data de Abertura:</div>
                  <div class="value">${formatDate(dadosOrdem.data_abertura)}</div>
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
                  <div class="value">${(ordem as any).clientes?.nome || 'N/A'}</div>
                </div>
                <div class="col">
                  <div class="label">Telefone:</div>
                  <div class="value">${(ordem as any).clientes?.telefone || 'N/A'}</div>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <div class="label">Email:</div>
                  <div class="value">${(ordem as any).clientes?.email || 'N/A'}</div>
                </div>
                <div class="col">
                  <div class="label">CPF/CNPJ:</div>
                  <div class="value">${(ordem as any).clientes?.cpf_cnpj || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">Dados do Equipamento</div>
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
              ${ordem.senha_equipamento ? `
                <div class="row">
                  <div class="col">
                    <div class="label">Senha do Equipamento:</div>
                    <div class="value">${ordem.senha_equipamento}</div>
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
          
          ${(dadosOrdem.produtos_utilizados?.length > 0 || dadosOrdem.pecas_utilizadas?.length > 0) ? `
            <div class="section">
              <div class="section-header">Produtos e Serviços Utilizados</div>
              <div class="section-content">
                ${dadosOrdem.produtos_utilizados?.map((item: any) => `
                  <div class="row" style="border-left: 3px solid #3b82f6; padding-left: 10px; margin-bottom: 10px;">
                    <div class="col">
                      <div class="label">${item.produto?.nome || 'Produto não encontrado'}:</div>
                      <div class="value">${item.produto?.descricao || 'Sem descrição'}</div>
                      <div class="value" style="font-size: 11px; color: #666;">
                        Categoria: ${item.produto?.categoria || 'N/A'} | 
                        Qtd: ${item.quantidade} | 
                        Unit: ${formatCurrency(item.valor_unitario)} | 
                        Total: ${formatCurrency(item.valor_total)}
                      </div>
                    </div>
                  </div>
                `).join('') || ''}
                ${dadosOrdem.pecas_utilizadas?.map((item: any) => `
                  <div class="row" style="border-left: 3px solid #f97316; padding-left: 10px; margin-bottom: 10px;">
                    <div class="col">
                      <div class="label">${item.nome}:</div>
                      <div class="value" style="font-size: 11px; color: #666;">
                        Categoria: Peça | 
                        Qtd: ${item.quantidade} | 
                        Unit: ${formatCurrency(item.valor_unitario)} | 
                        Total: ${formatCurrency(item.valor_total)}
                      </div>
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
                  <div class="label">Peças/Serviços:</div>
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
                  <div class="value" style="font-weight: bold; font-size: 14px;">${formatCurrency(ordem.valor_final)}</div>
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
          
          <div class="footer">
            Documento gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              Ordem de Serviço #{ordem.numero}
            </DialogTitle>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge className={statusColors[ordem.status as keyof typeof statusColors]}>
                      {statusLabels[ordem.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Prioridade</label>
                  <div className="mt-1">
                    <Badge className={prioridadeColors[ordem.prioridade as keyof typeof prioridadeColors]}>
                      {prioridadeLabels[ordem.prioridade as keyof typeof prioridadeLabels]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Abertura</label>
                  <p className="mt-1">{formatDate(ordem.data_abertura)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="mt-1">{dadosOrdem.clientes?.nome || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1">{dadosOrdem.clientes?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <p className="mt-1">{dadosOrdem.clientes?.telefone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CPF/CNPJ</label>
                  <p className="mt-1">{dadosOrdem.clientes?.cpf_cnpj || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Equipamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="text-sm font-medium text-gray-600">Número de Série</label>
                  <p className="mt-1">{ordem.numero_serie || 'N/A'}</p>
                </div>
              </div>
              
              {ordem.senha_equipamento && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Senha do Equipamento</label>
                  <p className="mt-1 font-mono bg-gray-50 p-2 rounded">{ordem.senha_equipamento}</p>
                </div>
              )}
              
              {ordem.acessorios && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Acessórios</label>
                  <p className="mt-1">{ordem.acessorios}</p>
                </div>
              )}
              
              {ordem.condicoes_equipamento && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Condições do Equipamento</label>
                  <p className="mt-1">{ordem.condicoes_equipamento}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnóstico e Reparo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diagnóstico e Reparo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              {ordem.tecnico_responsavel && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Técnico Responsável</label>
                  <p className="mt-1">{ordem.tecnico_responsavel}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Produtos e Serviços Utilizados */}
          {(dadosOrdem.produtos_utilizados?.length > 0 || dadosOrdem.pecas_utilizadas?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Produtos e Serviços Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Produtos Utilizados */}
                  {dadosOrdem.produtos_utilizados?.map((item: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.produto?.nome || 'Produto não encontrado'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.produto?.descricao || 'Sem descrição'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-500">
                              Categoria: <span className="font-medium">{item.produto?.categoria || 'N/A'}</span>
                            </span>
                            <span className="text-gray-500">
                              Qtd: <span className="font-medium">{item.quantidade}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Unit: {formatCurrency(item.valor_unitario)}</div>
                          <div className="font-semibold">{formatCurrency(item.valor_total)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Peças Utilizadas */}
                  {dadosOrdem.pecas_utilizadas?.map((item: any, index: number) => (
                    <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.nome}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-500">
                              Categoria: <span className="font-medium">Peça</span>
                            </span>
                            <span className="text-gray-500">
                              Qtd: <span className="font-medium">{item.quantidade}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Unit: {formatCurrency(item.valor_unitario)}</div>
                          <div className="font-semibold">{formatCurrency(item.valor_total)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Valores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Mão de Obra</label>
                  <p className="mt-1">{formatCurrency(ordem.valor_mao_obra)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Orçamento</label>
                  <p className="mt-1">{formatCurrency(ordem.valor_orcamento)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total</label>
                  <p className="mt-1">{formatCurrency(ordem.valor_total)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Desconto</label>
                  <p className="mt-1">{formatCurrency(ordem.desconto)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Acréscimo</label>
                  <p className="mt-1">{formatCurrency(ordem.acrescimo)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Valor Final</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(ordem.valor_final)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prazos e Garantia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prazos e Garantia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Prazo de Entrega</label>
                  <p className="mt-1">{ordem.prazo_entrega ? `${ordem.prazo_entrega} dias` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Garantia</label>
                  <p className="mt-1">{ordem.garantia ? `${ordem.garantia} dias` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Previsão de Entrega</label>
                  <p className="mt-1">{formatDate(ordem.data_previsao_entrega)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Aprovação</label>
                  <p className="mt-1">{formatDate(ordem.data_aprovacao)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status de Pagamento */}
          {ordem.forma_pagamento && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Forma de Pagamento</label>
                    <p className="mt-1 capitalize">{ordem.forma_pagamento.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status do Pagamento</label>
                    <p className="mt-1 capitalize">{ordem.status_pagamento}</p>
                  </div>
                  {ordem.data_pagamento && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data do Pagamento</label>
                      <p className="mt-1">{formatDate(ordem.data_pagamento)}</p>
                    </div>
                  )}
                  {ordem.data_vencimento && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Vencimento</label>
                      <p className="mt-1">{formatDate(ordem.data_vencimento)}</p>
                    </div>
                  )}
                </div>
                
                {ordem.observacoes_pagamento && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Observações do Pagamento</label>
                    <p className="mt-1">{ordem.observacoes_pagamento}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};