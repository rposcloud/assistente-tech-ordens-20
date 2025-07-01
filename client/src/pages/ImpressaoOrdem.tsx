import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { useOrdens } from '@/hooks/useOrdens';
import { useProfile } from '@/hooks/useProfile';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OrdemCompleta {
  id: string;
  numero: string;
  cliente: {
    nome: string;
    email?: string;
    telefone?: string;
    cpf_cnpj?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  tipo_equipamento: string;
  marca: string;
  modelo: string;
  numero_serie?: string;
  defeito_relatado: string;
  diagnostico_tecnico?: string;
  solucao_aplicada?: string;
  status: string;
  valor_total: string;
  valor_final: string;
  data_abertura: string;
  data_conclusao?: string;
  garantia: number;
  observacoes_internas?: string;
  tecnico_responsavel?: string;
  data_previsao_entrega?: string;
}

const statusLabels = {
  'aberta': 'Aberta',
  'em_andamento': 'Em Andamento',
  'aguardando_pecas': 'Aguardando Peças',
  'pronta': 'Pronta',
  'finalizada': 'Finalizada'
};

export const ImpressaoOrdem = () => {
  const { id } = useParams<{ id: string }>();
  const [ordem, setOrdem] = useState<OrdemCompleta | null>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  console.log('ImpressaoOrdem carregada, ID:', id);

  // Teste simples - retorna uma página simples primeiro
  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Página de Impressão</h1>
          <p className="text-gray-600">ID não encontrado na URL</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const response = await fetch(`/api/ordens/${id}/print`);
        if (response.ok) {
          const data = await response.json();
          setOrdem(data.ordem);
          setEmpresa(data.empresa);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDados();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('print-content');
      if (!element) return;

      // Configurações para melhor qualidade
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calcular dimensões para A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      // Centralizar na página
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`OS-${ordem?.numero || 'ordem'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback para impressão
      handlePrint();
    }
  };

  const handleVoltar = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados para impressão... (ID: {id})</p>
        </div>
      </div>
    );
  }

  if (!ordem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ordem de serviço não encontrada (ID: {id})</p>
          <Button onClick={handleVoltar} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Botões de ação - ocultos na impressão */}
      <div className="print:hidden fixed top-4 right-4 z-10 flex gap-2">
        <Button onClick={handleVoltar} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button onClick={handlePrint} size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Conteúdo da página - formatado para A4 */}
      <div id="print-content" className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
        {/* Cabeçalho da empresa */}
        <div className="border-b-2 border-gray-200 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {empresa?.nome_completo || 'Assistência Técnica'}
              </h1>
              {empresa?.empresa && (
                <p className="text-xl text-gray-700 mb-1">{empresa.empresa}</p>
              )}
              {empresa?.telefone && (
                <p className="text-gray-600">Tel: {empresa.telefone}</p>
              )}
            </div>
            <div className="text-right">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-800">Ordem de Serviço</p>
                <p className="text-2xl font-bold text-blue-900">#{ordem.numero}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do cliente e equipamento */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Cliente */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                Dados do Cliente
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nome:</span>
                  <p className="text-gray-900">{ordem.cliente.nome}</p>
                </div>
                {ordem.cliente.telefone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Telefone:</span>
                    <p className="text-gray-900">{ordem.cliente.telefone}</p>
                  </div>
                )}
                {ordem.cliente.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{ordem.cliente.email}</p>
                  </div>
                )}
                {ordem.cliente.cpf_cnpj && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">CPF/CNPJ:</span>
                    <p className="text-gray-900">{ordem.cliente.cpf_cnpj}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Equipamento */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                Dados do Equipamento
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Tipo:</span>
                  <p className="text-gray-900 capitalize">{ordem.tipo_equipamento}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Marca/Modelo:</span>
                  <p className="text-gray-900">{ordem.marca} {ordem.modelo}</p>
                </div>
                {ordem.numero_serie && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">N° Série:</span>
                    <p className="text-gray-900">{ordem.numero_serie}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Defeito e diagnóstico */}
        <div className="mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                Descrição do Serviço
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Defeito Relatado:</span>
                  <p className="text-gray-900 mt-1">{ordem.defeito_relatado}</p>
                </div>
                {ordem.diagnostico_tecnico && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Diagnóstico Técnico:</span>
                    <p className="text-gray-900 mt-1">{ordem.diagnostico_tecnico}</p>
                  </div>
                )}
                {ordem.solucao_aplicada && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Solução Aplicada:</span>
                    <p className="text-gray-900 mt-1">{ordem.solucao_aplicada}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do serviço */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Status e datas */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                Status e Datas
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <p className="text-gray-900">{statusLabels[ordem.status as keyof typeof statusLabels]}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Data de Abertura:</span>
                  <p className="text-gray-900">{new Date(ordem.data_abertura).toLocaleDateString('pt-BR')}</p>
                </div>
                {ordem.data_previsao_entrega && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Previsão de Entrega:</span>
                    <p className="text-gray-900">{new Date(ordem.data_previsao_entrega).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {ordem.data_conclusao && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Data de Conclusão:</span>
                    <p className="text-gray-900">{new Date(ordem.data_conclusao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Garantia:</span>
                  <p className="text-gray-900">{ordem.garantia} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                Valores
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Valor do Serviço:</span>
                  <p className="text-gray-900">R$ {parseFloat(ordem.valor_total).toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">Total:</span>
                  <p className="text-xl font-bold text-gray-900">R$ {parseFloat(ordem.valor_final).toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Produtos e Serviços Utilizados */}
        {((ordem as any).produtos_utilizados?.length > 0 || (ordem as any).pecas_utilizadas?.length > 0) && (
          <div className="mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                  Produtos e Serviços Utilizados
                </h3>
                <div className="space-y-4">
                  {/* Produtos */}
                  {(ordem as any).produtos_utilizados?.map((item: any, index: number) => (
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
                          <div className="text-sm text-gray-500">Unit: R$ {parseFloat(item.valor_unitario).toFixed(2).replace('.', ',')}</div>
                          <div className="font-medium text-gray-900">Total: R$ {parseFloat(item.valor_total).toFixed(2).replace('.', ',')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Peças */}
                  {(ordem as any).pecas_utilizadas?.map((item: any, index: number) => (
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
                          <div className="text-sm text-gray-500">Unit: R$ {parseFloat(item.valor_unitario).toFixed(2).replace('.', ',')}</div>
                          <div className="font-medium text-gray-900">Total: R$ {parseFloat(item.valor_total).toFixed(2).replace('.', ',')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Observações */}
        {ordem.observacoes_internas && (
          <div className="mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                  Observações
                </h3>
                <p className="text-gray-900">{ordem.observacoes_internas}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Campo de assinatura */}
        <div className="mt-12 pt-8 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 gap-16">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-16">
                <p className="text-sm text-gray-600">Assinatura do Técnico</p>
                {ordem.tecnico_responsavel && (
                  <p className="text-sm text-gray-800 mt-1">{ordem.tecnico_responsavel}</p>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-16">
                <p className="text-sm text-gray-600">Assinatura do Cliente</p>
                <p className="text-sm text-gray-800 mt-1">{ordem.cliente.nome}</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>Este documento serve como comprovante do serviço prestado.</p>
            <p>Garantia válida por {ordem.garantia} dias a partir da data de conclusão.</p>
          </div>
        </div>
      </div>
    </div>
  );
};