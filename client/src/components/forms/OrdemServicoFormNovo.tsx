import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientes } from '@/hooks/useClientes';
import { OrdemServico } from '@/types';
import { ProdutosOrdemSection } from './ProdutosOrdemSection';
import { toast } from 'sonner';

interface ProdutoUtilizado {
  id?: string;
  produto_id?: string;
  nome: string;
  categoria: 'peca' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  tipo: 'produto' | 'peca_avulsa';
}

interface OrdemServicoFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  loading?: boolean;
}

export const OrdemServicoFormNovo: React.FC<OrdemServicoFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false
}) => {
  const { clientes } = useClientes();
  const [produtosUtilizados, setProdutosUtilizados] = useState<ProdutoUtilizado[]>([]);

  const [formData, setFormData] = useState({
    cliente_id: initialData?.cliente_id || '',
    tipo_equipamento: initialData?.tipo_equipamento || 'smartphone',
    marca: initialData?.marca || '',
    modelo: initialData?.modelo || '',
    numero_serie: initialData?.numero_serie || '',
    senha_equipamento: initialData?.senha_equipamento || '',
    defeito_relatado: initialData?.defeito_relatado || '',
    diagnostico_tecnico: initialData?.diagnostico_tecnico || '',
    solucao_aplicada: initialData?.solucao_aplicada || '',
    tecnico_responsavel: initialData?.tecnico_responsavel || '',
    valor_mao_obra: initialData?.valor_mao_obra || '0',
    valor_orcamento: initialData?.valor_orcamento || '0',
    desconto: initialData?.desconto || '0',
    acrescimo: initialData?.acrescimo || '0',
    garantia: initialData?.garantia || 90,
    status: initialData?.status || 'aguardando_diagnostico',
    prioridade: initialData?.prioridade || 'normal',
    observacoes_internas: initialData?.observacoes_internas || ''
  });

  // Carregar produtos utilizados se estiver editando
  useEffect(() => {
    if (initialData && initialData.produtos_utilizados) {
      const produtos = initialData.produtos_utilizados.map((item: any) => ({
        id: item.id,
        produto_id: item.produto_id,
        nome: item.produto?.nome || item.nome || 'Produto sem nome',
        categoria: item.produto?.categoria || 'peca',
        quantidade: item.quantidade,
        valor_unitario: parseFloat(item.valor_unitario) || 0,
        valor_total: parseFloat(item.valor_total) || 0,
        tipo: item.produto_id ? 'produto' : 'peca_avulsa'
      }));
      setProdutosUtilizados(produtos);
    }

    if (initialData && initialData.pecas_utilizadas) {
      const pecas = initialData.pecas_utilizadas.map((item: any) => ({
        id: item.id,
        nome: item.nome,
        categoria: 'peca' as const,
        quantidade: item.quantidade,
        valor_unitario: parseFloat(item.valor_unitario) || 0,
        valor_total: parseFloat(item.valor_total) || 0,
        tipo: 'peca_avulsa' as const
      }));
      setProdutosUtilizados(prev => [...prev, ...pecas]);
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calcularValorTotal = () => {
    const valorProdutos = produtosUtilizados.reduce((total, item) => total + item.valor_total, 0);
    const valorMaoObra = parseFloat(formData.valor_mao_obra) || 0;
    const valorOrcamento = parseFloat(formData.valor_orcamento) || 0;
    const desconto = parseFloat(formData.desconto) || 0;
    const acrescimo = parseFloat(formData.acrescimo) || 0;
    
    return valorProdutos + valorMaoObra + valorOrcamento - desconto + acrescimo;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cliente_id) {
      toast.error('Selecione um cliente');
      return;
    }

    if (!formData.defeito_relatado) {
      toast.error('Descreva o defeito relatado');
      return;
    }

    const valorTotal = calcularValorTotal();
    
    const dadosOrdem = {
      ...formData,
      valor_total: valorTotal.toString(),
      valor_final: valorTotal.toString(),
      produtos_utilizados: produtosUtilizados,
      data_abertura: initialData?.data_abertura || new Date().toISOString(),
      historico_status: initialData?.historico_status || []
    };

    console.log('Submetendo dados da ordem:', dadosOrdem);
    onSubmit(dadosOrdem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cliente">Cliente *</Label>
            <Select value={formData.cliente_id} onValueChange={(value) => handleInputChange('cliente_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id!}>
                    {cliente.nome} - {cliente.telefone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Equipamento */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Equipamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_equipamento">Tipo de Equipamento</Label>
              <Select value={formData.tipo_equipamento} onValueChange={(value) => handleInputChange('tipo_equipamento', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="notebook">Notebook</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                placeholder="Ex: Apple, Samsung, Dell"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Ex: iPhone 13, Galaxy S21"
              />
            </div>
            <div>
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                placeholder="Número de série do equipamento"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="senha_equipamento">Senha do Equipamento</Label>
            <Input
              id="senha_equipamento"
              value={formData.senha_equipamento}
              onChange={(e) => handleInputChange('senha_equipamento', e.target.value)}
              placeholder="Senha para acesso ao equipamento"
            />
          </div>
        </CardContent>
      </Card>

      {/* Descrição do Problema */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição do Problema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defeito_relatado">Defeito Relatado *</Label>
            <Textarea
              id="defeito_relatado"
              value={formData.defeito_relatado}
              onChange={(e) => handleInputChange('defeito_relatado', e.target.value)}
              placeholder="Descreva o problema relatado pelo cliente"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="diagnostico_tecnico">Diagnóstico Técnico</Label>
            <Textarea
              id="diagnostico_tecnico"
              value={formData.diagnostico_tecnico}
              onChange={(e) => handleInputChange('diagnostico_tecnico', e.target.value)}
              placeholder="Diagnóstico técnico do problema"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="solucao_aplicada">Solução Aplicada</Label>
            <Textarea
              id="solucao_aplicada"
              value={formData.solucao_aplicada}
              onChange={(e) => handleInputChange('solucao_aplicada', e.target.value)}
              placeholder="Descreva a solução que foi aplicada"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Produtos e Serviços */}
      <ProdutosOrdemSection
        produtosUtilizados={produtosUtilizados}
        onProdutosChange={setProdutosUtilizados}
      />

      {/* Informações de Serviço */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tecnico_responsavel">Técnico Responsável</Label>
              <Input
                id="tecnico_responsavel"
                value={formData.tecnico_responsavel}
                onChange={(e) => handleInputChange('tecnico_responsavel', e.target.value)}
                placeholder="Nome do técnico"
              />
            </div>
            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="valor_mao_obra">Valor Mão de Obra</Label>
              <Input
                id="valor_mao_obra"
                type="number"
                step="0.01"
                value={formData.valor_mao_obra}
                onChange={(e) => handleInputChange('valor_mao_obra', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="desconto">Desconto</Label>
              <Input
                id="desconto"
                type="number"
                step="0.01"
                value={formData.desconto}
                onChange={(e) => handleInputChange('desconto', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="garantia">Garantia (dias)</Label>
              <Input
                id="garantia"
                type="number"
                value={formData.garantia}
                onChange={(e) => handleInputChange('garantia', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aguardando_diagnostico">Aguardando Diagnóstico</SelectItem>
                <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                <SelectItem value="aguardando_pecas">Aguardando Peças</SelectItem>
                <SelectItem value="em_reparo">Em Reparo</SelectItem>
                <SelectItem value="pronto_entrega">Pronto para Entrega</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes_internas">Observações Internas</Label>
            <Textarea
              id="observacoes_internas"
              value={formData.observacoes_internas}
              onChange={(e) => handleInputChange('observacoes_internas', e.target.value)}
              placeholder="Observações internas sobre o serviço"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Produtos/Serviços:</span>
              <span>R$ {produtosUtilizados.reduce((total, item) => total + item.valor_total, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Mão de Obra:</span>
              <span>R$ {parseFloat(formData.valor_mao_obra || '0').toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto:</span>
              <span>- R$ {parseFloat(formData.desconto || '0').toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total Final:</span>
              <span>R$ {calcularValorTotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar Ordem' : 'Criar Ordem'}
        </Button>
      </div>
    </form>
  );
};