import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Wrench, Package, CreditCard, FileText, Clock, Shield, Building, CheckCircle, Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface VisualizacaoOSProps {
  ordem: any;
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

export const VisualizacaoOS: React.FC<VisualizacaoOSProps> = ({ ordem }) => {
  const { toast } = useToast();
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  
  // Buscar dados do perfil da empresa do contexto de autenticação
  const { profile } = useAuth();

  // Buscar dados atualizados da ordem para garantir que os produtos estão sincronizados
  const { data: ordemAtualizada } = useQuery({
    queryKey: ['/api/ordens', ordem?.id],
    queryFn: async () => {
      if (!ordem?.id) return null;
      console.log('🔍 VisualizacaoOS: Buscando dados atualizados da ordem', ordem.id);
      const response = await fetch(`/api/ordens/${ordem.id}`);
      if (!response.ok) throw new Error('Erro ao buscar ordem');
      const data = await response.json();
      console.log('📦 VisualizacaoOS: Dados recebidos do servidor:', {
        id: data.id,
        produtos_utilizados: data.produtos_utilizados?.length || 0,
        produtos_detalhes: data.produtos_utilizados
      });
      return data;
    },
    enabled: !!ordem?.id,
    refetchOnMount: true, // Sempre recarregar quando o componente monta
    refetchOnWindowFocus: false
  });

  // Usar a ordem atualizada se disponível, senão usar a ordem passada como prop
  const ordemCompleta = ordemAtualizada || ordem;
  
  // Log para monitorar qual dados está sendo usado
  console.log('🎯 VisualizacaoOS: Dados finais sendo usados:', {
    fonte: ordemAtualizada ? 'servidor_atualizado' : 'prop_original',
    id: ordemCompleta?.id,
    produtos_utilizados: ordemCompleta?.produtos_utilizados?.length || 0,
    produtos_detalhes: ordemCompleta?.produtos_utilizados
  });
  
  const abrirDialogoFinalizar = () => {
    if (ordemCompleta?.status === 'finalizada') {
      toast({
        title: "Erro",
        description: "Esta OS já foi finalizada",
        variant: "destructive"
      });
      return;
    }
    setShowFinalizarDialog(true);
  };

  const abrirImpressao = () => {
    if (!ordemCompleta?.id) {
      console.error('ID da ordem não encontrado:', ordemCompleta);
      toast({
        title: "Erro",
        description: "ID da ordem não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Abrindo impressão para ordem:', ordemCompleta.id);
    const url = `/impressao-ordem/${ordemCompleta.id}`;
    console.log('URL da impressão:', url);
    window.open(url, '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
  };

  const finalizarOS = async () => {
      try {
        // Atualizar status da OS para 'finalizada' com dados de pagamento
        await api.ordens.update(ordemCompleta.id, {
          status: 'finalizada',
          forma_pagamento: formaPagamento,
          data_pagamento: dataVencimento
        });

        toast({
          title: "Sucesso",
          description: "OS finalizada com sucesso! Entrada financeira criada automaticamente."
        });
        
        // Fechar o diálogo - o backend já criará a entrada financeira
        setShowFinalizarDialog(false);
        // Usar uma abordagem melhor que window.location.reload()
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } catch (error) {
        console.error('Erro:', error);
        toast({
          title: "Erro",
          description: "Erro ao finalizar OS",
          variant: "destructive"
        });
      }
  };
  
  // Verificação de segurança
  if (!ordemCompleta) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Carregando ordem de serviço...</p>
      </div>
    );
  }

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
    <div className="visualizacao-os-content w-full max-w-none p-4 space-y-4 print:p-3 print:space-y-3">
      {/* Cabeçalho da Empresa */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 border border-gray-200 rounded-lg">
        <div className="p-4 print:p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg print:p-1">
                <Building className="h-6 w-6 text-white print:h-4 print:w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 print:text-base">
                  {profile?.empresa || 'Nome da Empresa'}
                </h2>
                <div className="flex flex-col gap-1 text-sm text-gray-600 print:text-sm">
                  {(profile as any)?.cnpj && <p>CNPJ: {(profile as any).cnpj}</p>}
                  {(profile as any)?.inscricao_estadual && <p>IE: {(profile as any).inscricao_estadual}</p>}
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600 print:text-sm max-w-xs">
              <div className="space-y-1">
                {((profile as any)?.endereco || (profile as any)?.cidade) && <p className="font-medium">Endereço:</p>}
                {(profile as any)?.endereco && (
                  <p>
                    {(profile as any).endereco}
                    {(profile as any)?.numero && `, ${(profile as any).numero}`}
                    {(profile as any)?.complemento && ` - ${(profile as any).complemento}`}
                  </p>
                )}
                {((profile as any)?.bairro || (profile as any)?.cep) && (
                  <p>
                    {(profile as any)?.bairro && `${(profile as any).bairro}`}
                    {(profile as any)?.bairro && (profile as any)?.cep && ' - '}
                    {(profile as any)?.cep && `CEP: ${(profile as any).cep}`}
                  </p>
                )}
                {((profile as any)?.cidade || (profile as any)?.estado) && (
                  <p>{(profile as any)?.cidade}{(profile as any)?.cidade && (profile as any)?.estado && '/'}{(profile as any)?.estado}</p>
                )}
              </div>
              <div className="mt-2 space-y-1">
                {profile?.telefone && (
                  <p><span className="font-medium">Tel:</span> {profile.telefone}</p>
                )}
                {(profile as any)?.email_empresa && (
                  <p><span className="font-medium">Email:</span> {(profile as any).email_empresa}</p>
                )}
                {(profile as any)?.site && (
                  <p><span className="font-medium">Site:</span> {(profile as any).site}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cabeçalho da Ordem de Serviço */}
      <div className="border-l-4 border-l-blue-500 bg-white border border-gray-200 rounded-lg">
        <div className="p-4 print:p-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900 print:text-xl">
                Ordem de Serviço #{ordemCompleta.numero}
              </h1>
              <p className="text-gray-600 text-sm print:text-sm">
                {ordemCompleta.clientes?.nome} - {ordemCompleta.clientes?.telefone}
              </p>
            </div>
            <div className="flex gap-2 print:gap-1">
              <Badge className={`px-2 py-1 text-xs font-medium border print:px-1 ${statusColors[ordemCompleta.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {statusLabels[ordemCompleta.status as keyof typeof statusLabels] || ordemCompleta.status}
              </Badge>
              <Badge className={`px-2 py-1 text-xs font-medium border print:px-1 ${prioridadeColors[ordemCompleta.prioridade as keyof typeof prioridadeColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {ordemCompleta.prioridade?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 1: Cliente e Equipamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-3">
        {/* Informações do Cliente */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold print:text-xs">
              <User className="h-4 w-4 text-blue-600 print:h-3 print:w-3" />
              Cliente
            </h3>
          </div>
          <div className="p-3 print:p-2">
            <div className="grid grid-cols-2 gap-3 print:gap-2 text-xs print:text-sm">
              <div>
                <p className="font-medium text-gray-700">Nome:</p>
                <p className="text-gray-900">{ordemCompleta.clientes?.nome}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Telefone:</p>
                <p className="text-gray-900">{ordemCompleta.clientes?.telefone}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-700">E-mail:</p>
                <p className="text-gray-900">{ordemCompleta.clientes?.email || 'Não informado'}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-700">Endereço:</p>
                <p className="text-gray-900 text-xs">
                  {ordemCompleta.clientes?.endereco ? 
                    `${ordemCompleta.clientes.endereco}, ${ordemCompleta.clientes.numero || 'S/N'} - ${ordemCompleta.clientes.bairro}, ${ordemCompleta.clientes.cidade}/${ordemCompleta.clientes.estado}` 
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
            <h3 className="flex items-center gap-2 text-sm font-semibold print:text-xs">
              <Package className="h-4 w-4 text-green-600 print:h-3 print:w-3" />
              Equipamento
            </h3>
          </div>
          <div className="p-3 print:p-2">
            <div className="grid grid-cols-2 gap-3 print:gap-2 text-xs print:text-sm">
              <div>
                <p className="font-medium text-gray-700">Tipo:</p>
                <p className="text-gray-900 capitalize">{ordemCompleta.tipo_equipamento}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Marca:</p>
                <p className="text-gray-900">{ordemCompleta.marca}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Modelo:</p>
                <p className="text-gray-900">{ordemCompleta.modelo}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">N° Série:</p>
                <p className="text-gray-900">{ordemCompleta.numero_serie || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-700">Senha:</p>
                <p className="text-gray-900">{ordemCompleta.senha_equipamento || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição do Problema */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-3 border-b border-gray-100">
          <h3 className="flex items-center gap-2 text-sm font-semibold print:text-xs">
            <FileText className="h-4 w-4 text-orange-600 print:h-3 print:w-3" />
            Descrição do Problema
          </h3>
        </div>
        <div className="p-3 print:p-2 space-y-3 print:space-y-2">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Defeito Relatado:</p>
            <p className="text-xs text-gray-900 bg-gray-50 p-2 rounded border print:p-1">
              {ordemCompleta.defeito_relatado}
            </p>
          </div>
          
          {ordemCompleta.diagnostico_tecnico && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Diagnóstico Técnico:</p>
              <p className="text-xs text-gray-900 bg-blue-50 p-2 rounded border border-blue-200 print:p-1">
                {ordemCompleta.diagnostico_tecnico}
              </p>
            </div>
          )}
          
          {ordemCompleta.solucao_aplicada && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Solução Aplicada:</p>
              <p className="text-xs text-gray-900 bg-green-50 p-2 rounded border border-green-200 print:p-1">
                {ordemCompleta.solucao_aplicada}
              </p>
            </div>
          )}
        </div>
      </div>

      

      {/* Linha 2: Serviço e Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:gap-3">
        {/* Informações de Serviço */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold print:text-xs">
              <Clock className="h-4 w-4 text-indigo-600 print:h-3 print:w-3" />
              Serviço
            </h3>
          </div>
          <div className="p-3 print:p-2">
            <div className="space-y-2 print:space-y-1 text-xs print:text-sm">
              <div>
                <p className="font-medium text-gray-700">Data Abertura:</p>
                <p className="text-gray-900">{formatDate(ordemCompleta.data_abertura)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Técnico:</p>
                <p className="text-gray-900">{ordemCompleta.tecnico_responsavel || 'Não atribuído'}</p>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                <div>
                  <p className="font-medium text-gray-700">Garantia: {ordemCompleta.garantia} dias</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos e Serviços Utilizados */}
        {((ordemCompleta.produtos_utilizados && ordemCompleta.produtos_utilizados.length > 0) || 
          (ordemCompleta.pecas_utilizadas && ordemCompleta.pecas_utilizadas.length > 0)) && (
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
            <div className="p-3 border-b border-gray-100">
              <h3 className="flex items-center gap-2 text-sm font-semibold print:text-xs">
                <Package className="h-4 w-4 text-blue-600 print:h-3 print:w-3" />
                Produtos e Serviços Utilizados
              </h3>
            </div>
            <div className="p-3 print:p-2">
              <div className="space-y-3 print:space-y-2">
                {/* Produtos Cadastrados */}
                {ordemCompleta.produtos_utilizados && ordemCompleta.produtos_utilizados.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2 print:text-xs">Produtos/Serviços:</h4>
                    <div className="space-y-1 print:space-y-1">
                      {ordemCompleta.produtos_utilizados.map((produto: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-xs print:text-xs bg-gray-50 p-2 rounded print:p-1">
                          <div className="flex-1">
                            <span className="font-medium">{produto.produto?.nome || 'Produto'}</span>
                            {produto.produto?.descricao && (
                              <span className="text-gray-600 ml-2">- {produto.produto.descricao}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 print:gap-2">
                            <span className="text-gray-600">Qtd: {produto.quantidade}</span>
                            <span className="text-gray-600">Unit: {formatCurrency(produto.valor_unitario)}</span>
                            <span className="font-medium text-green-600">{formatCurrency(produto.valor_total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Peças Avulsas */}
                {ordemCompleta.pecas_utilizadas && ordemCompleta.pecas_utilizadas.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2 print:text-xs">Peças Avulsas:</h4>
                    <div className="space-y-1 print:space-y-1">
                      {ordemCompleta.pecas_utilizadas.map((peca: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-xs print:text-xs bg-gray-50 p-2 rounded print:p-1">
                          <div className="flex-1">
                            <span className="font-medium">{peca.nome}</span>
                          </div>
                          <div className="flex items-center gap-4 print:gap-2">
                            <span className="text-gray-600">Qtd: {peca.quantidade}</span>
                            <span className="text-gray-600">Unit: {formatCurrency(peca.valor_unitario)}</span>
                            <span className="font-medium text-green-600">{formatCurrency(peca.valor_total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumo Financeiro */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold print:text-xs">
              <CreditCard className="h-4 w-4 text-emerald-600 print:h-3 print:w-3" />
              Resumo Financeiro
            </h3>
          </div>
          <div className="p-3 print:p-2">
            <div className="grid grid-cols-2 gap-4 print:gap-2 text-xs print:text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mão de Obra:</span>
                  <span>{formatCurrency(ordemCompleta.valor_mao_obra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orçamento:</span>
                  <span>{formatCurrency(ordemCompleta.valor_orcamento)}</span>
                </div>
                {parseFloat(ordemCompleta.desconto || '0') > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>- {formatCurrency(ordemCompleta.desconto)}</span>
                  </div>
                )}
                {parseFloat(ordemCompleta.acrescimo || '0') > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Acréscimo:</span>
                    <span>+ {formatCurrency(ordemCompleta.acrescimo)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">VALOR TOTAL</p>
                  <p className="text-2xl font-bold text-green-600 print:text-xl">
                    {formatCurrency(ordemCompleta.valor_total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observações Internas */}
      {ordemCompleta.observacoes_internas && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold print:text-xs">Observações Internas</h3>
          </div>
          <div className="p-3 print:p-2">
            <p className="text-xs text-gray-900 bg-yellow-50 p-2 rounded border border-yellow-200 print:p-1">
              {ordemCompleta.observacoes_internas}
            </p>
          </div>
        </div>
      )}

      {/* Campos de Assinatura */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-3 border-b border-gray-100">
          <h3 className="flex items-center gap-2 text-sm font-semibold print:text-xs">
            <FileText className="h-4 w-4 text-blue-600 print:h-3 print:w-3" />
            Assinaturas
          </h3>
        </div>
        <div className="p-4 print:p-3">
          {/* Assinaturas lado a lado */}
          <div className="grid grid-cols-2 gap-6 print:gap-4 mb-4 print:mb-3">
            {/* Assinatura do Cliente */}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-700 mb-2 print:mb-1 print:text-sm">Assinatura do Cliente</p>
              <div className="border-b-2 border-gray-300 h-10 print:h-8 mb-2 print:mb-1"></div>
              <div className="text-xs text-gray-600 print:text-sm">
                <p className="font-medium">{ordemCompleta.clientes?.nome}</p>
                <p>CPF/CNPJ: {ordemCompleta.clientes?.cpf_cnpj || 'Não informado'}</p>
                <p>Data: ___/___/______</p>
              </div>
            </div>

            {/* Assinatura do Técnico */}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-700 mb-2 print:mb-1 print:text-sm">Assinatura do Técnico</p>
              <div className="border-b-2 border-gray-300 h-10 print:h-8 mb-2 print:mb-1"></div>
              <div className="text-xs text-gray-600 print:text-sm">
                <p className="font-medium">{ordemCompleta.tecnico_responsavel || 'Técnico Responsável'}</p>
                <p>Empresa: {profile?.empresa || 'Nome da Empresa'}</p>
                <p>Data: ___/___/______</p>
              </div>
            </div>
          </div>

          {/* Termo de Responsabilidade */}
          <div className="pt-3 print:pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 print:text-sm space-y-1">
              <p className="font-medium text-center">TERMO DE RESPONSABILIDADE</p>
              <p className="text-justify leading-tight">
                Declaro que recebi o equipamento descrito nesta ordem de serviço em perfeitas condições de funcionamento e que todos os serviços foram executados conforme solicitado. Estou ciente da garantia oferecida e das condições de uso.{ordemCompleta.garantia && ` A garantia dos serviços prestados é de ${ordemCompleta.garantia} dias a partir da data de entrega.`}
              </p>
              <p className="text-center mt-2 print:mt-1 text-xs print:text-sm">
                <strong>Data de entrega:</strong> ___/___/______ às ___:___ h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end items-center print:hidden">
        {ordemCompleta.status !== 'finalizada' && (
          <Button 
            onClick={abrirDialogoFinalizar}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalizar OS
          </Button>
        )}
      </div>

      {/* Diálogo de Finalização */}
      <Dialog open={showFinalizarDialog} onOpenChange={setShowFinalizarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Ordem de Serviço</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Isso irá alterar o status para "Entregue" e criar uma entrada financeira de receita.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="parcelado">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data-vencimento">Data de Vencimento</Label>
                <Input
                  id="data-vencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={finalizarOS} className="bg-green-600 hover:bg-green-700">
              Finalizar OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};