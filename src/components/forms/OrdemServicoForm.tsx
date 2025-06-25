
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useClientes } from '@/hooks/useClientes';
import { useProdutos } from '@/hooks/useProdutos';
import { OrdemServico } from '@/hooks/useOrdens';

interface ProdutoSelecionado {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface OrdemServicoFormProps {
  onSubmit: (data: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: OrdemServico;
  loading?: boolean;
}

export const OrdemServicoForm: React.FC<OrdemServicoFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false
}) => {
  const { clientes } = useClientes();
  const { produtos } = useProdutos();
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>('');

  // Initialize form data with proper defaults and handle editing
  const [formData, setFormData] = useState({
    cliente_id: initialData?.cliente_id || '',
    tipo_equipamento: initialData?.tipo_equipamento || 'smartphone',
    marca: initialData?.marca || '',
    modelo: initialData?.modelo || '',
    numero_serie: initialData?.numero_serie || '',
    defeito_relatado: initialData?.defeito_relatado || '',
    diagnostico_tecnico: initialData?.diagnostico_tecnico || '',
    solucao_aplicada: initialData?.solucao_aplicada || '',
    tecnico_responsavel: initialData?.tecnico_responsavel || '',
    valor_mao_obra: initialData?.valor_mao_obra || 0,
    valor_total: initialData?.valor_total || 0,
    valor_final: initialData?.valor_final || 0,
    status: initialData?.status || 'aguardando_diagnostico',
    garantia: initialData?.garantia || 90,
    observacoes_internas: initialData?.observacoes_internas || '',
    senha_equipamento: initialData?.senha_equipamento || '',
    acessorios: initialData?.acessorios || '',
    desconto: initialData?.desconto || 0,
    acrescimo: initialData?.acrescimo || 0
  });

  // Calculate final value automatically
  useEffect(() => {
    const valorProdutos = produtosSelecionados.reduce((total, produto) => total + produto.valorTotal, 0);
    const valorBase = (formData.valor_mao_obra || 0) + valorProdutos;
    const desconto = (formData.desconto || 0);
    const acrescimo = (formData.acrescimo || 0);
    const valorTotal = valorBase;
    const valorFinal = valorTotal - desconto + acrescimo;
    
    setFormData(prev => ({ 
      ...prev, 
      valor_total: valorTotal,
      valor_final: valorFinal 
    }));
  }, [formData.valor_mao_obra, formData.desconto, formData.acrescimo, produtosSelecionados]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.cliente_id) {
      alert('Por favor, selecione um cliente');
      return;
    }
    
    if (!formData.defeito_relatado.trim()) {
      alert('Por favor, informe o defeito relatado');
      return;
    }

    if (!formData.marca.trim()) {
      alert('Por favor, informe a marca do equipamento');
      return;
    }

    if (!formData.modelo.trim()) {
      alert('Por favor, informe o modelo do equipamento');
      return;
    }

    // Prepare complete data for submission
    const dadosCompletos = {
      cliente_id: formData.cliente_id,
      tipo_equipamento: formData.tipo_equipamento,
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      numero_serie: formData.numero_serie?.trim() || null,
      defeito_relatado: formData.defeito_relatado.trim(),
      diagnostico_tecnico: formData.diagnostico_tecnico?.trim() || null,
      solucao_aplicada: formData.solucao_aplicada?.trim() || null,
      tecnico_responsavel: formData.tecnico_responsavel?.trim() || null,
      valor_mao_obra: Number(formData.valor_mao_obra) || 0,
      valor_total: Number(formData.valor_total) || 0,
      valor_final: Number(formData.valor_final) || 0,
      desconto: Number(formData.desconto) || 0,
      acrescimo: Number(formData.acrescimo) || 0,
      garantia: Number(formData.garantia) || 90,
      status: formData.status,
      observacoes_internas: formData.observacoes_internas?.trim() || null,
      senha_equipamento: formData.senha_equipamento?.trim() || null,
      acessorios: formData.acessorios?.trim() || null,
      // Fields that will be set by the backend
      numero: '',
      user_id: '',
      data_abertura: new Date().toISOString(),
      finalizada: false,
      aprovado_cliente: false,
      historico_status: [],
      // Optional fields with defaults
      valor_orcamento: 0,
      lucro: 0,
      margem_lucro: 0,
      prioridade: 'normal'
    };

    console.log('Submitting order data:', dadosCompletos);
    onSubmit(dadosCompletos);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const adicionarProduto = (produtoId: string) => {
    if (!produtoId) return;
    
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    // Check if product is already added
    const produtoExistente = produtosSelecionados.find(p => p.id === produtoId);
    if (produtoExistente) {
      // Increase quantity if already exists
      const index = produtosSelecionados.findIndex(p => p.id === produtoId);
      atualizarQuantidadeProduto(index, produtoExistente.quantidade + 1);
    } else {
      // Add new product
      const novoProduto: ProdutoSelecionado = {
        id: produto.id,
        nome: produto.nome,
        quantidade: 1,
        valorUnitario: produto.precoVenda,
        valorTotal: produto.precoVenda
      };

      setProdutosSelecionados(prev => [...prev, novoProduto]);
    }

    // Reset selector
    setProdutoSelecionado('');
  };

  const removerProduto = (index: number) => {
    setProdutosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerProduto(index);
      return;
    }

    setProdutosSelecionados(prev => 
      prev.map((produto, i) => 
        i === index 
          ? { ...produto, quantidade, valorTotal: quantidade * produto.valorUnitario }
          : produto
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Data */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => updateField('cliente_id', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_equipamento">Tipo de Equipamento *</Label>
              <Select value={formData.tipo_equipamento} onValueChange={(value) => updateField('tipo_equipamento', value)} required>
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

            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => updateField('marca', e.target.value)}
                placeholder="Ex: Apple, Samsung, Dell"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => updateField('modelo', e.target.value)}
                placeholder="Ex: iPhone 13, Galaxy S21"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e) => updateField('numero_serie', e.target.value)}
                placeholder="Número de série"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha_equipamento">Senha/PIN</Label>
              <Input
                id="senha_equipamento"
                value={formData.senha_equipamento}
                onChange={(e) => updateField('senha_equipamento', e.target.value)}
                placeholder="Senha de desbloqueio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defeito_relatado">Defeito Relatado *</Label>
              <Textarea
                id="defeito_relatado"
                value={formData.defeito_relatado}
                onChange={(e) => updateField('defeito_relatado', e.target.value)}
                placeholder="Problema relatado pelo cliente"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acessorios">Acessórios</Label>
              <Textarea
                id="acessorios"
                value={formData.acessorios}
                onChange={(e) => updateField('acessorios', e.target.value)}
                placeholder="Carregador, fone, capa..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tecnico_responsavel">Técnico</Label>
              <Input
                id="tecnico_responsavel"
                value={formData.tecnico_responsavel}
                onChange={(e) => updateField('tecnico_responsavel', e.target.value)}
                placeholder="Nome do técnico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguardando_diagnostico">Aguardando Diagnóstico</SelectItem>
                  <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                  <SelectItem value="aguardando_pecas">Aguardando Peças</SelectItem>
                  <SelectItem value="em_reparo">Em Reparo</SelectItem>
                  <SelectItem value="pronto_entrega">Pronto p/ Entrega</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="garantia">Garantia (dias)</Label>
              <Input
                id="garantia"
                type="number"
                value={formData.garantia}
                onChange={(e) => updateField('garantia', parseInt(e.target.value) || 90)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products and Services */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos e Serviços</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Adicionar Produto/Serviço</Label>
            <Select value={produtoSelecionado} onValueChange={adicionarProduto}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto ou serviço" />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id}>
                    {produto.nome} - R$ {produto.precoVenda.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {produtosSelecionados.length > 0 && (
            <div className="space-y-2">
              <Label>Produtos/Serviços Selecionados</Label>
              <div className="space-y-2">
                {produtosSelecionados.map((produto, index) => (
                  <div key={`${produto.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-sm text-gray-600">
                        R$ {produto.valorUnitario.toFixed(2)} x {produto.quantidade} = R$ {produto.valorTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={produto.quantidade}
                        onChange={(e) => atualizarQuantidadeProduto(index, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removerProduto(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_mao_obra">Mão de Obra (R$)</Label>
              <Input
                id="valor_mao_obra"
                type="number"
                step="0.01"
                value={formData.valor_mao_obra}
                onChange={(e) => updateField('valor_mao_obra', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desconto">Desconto (R$)</Label>
              <Input
                id="desconto"
                type="number"
                step="0.01"
                value={formData.desconto}
                onChange={(e) => updateField('desconto', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acrescimo">Acréscimo (R$)</Label>
              <Input
                id="acrescimo"
                type="number"
                step="0.01"
                value={formData.acrescimo}
                onChange={(e) => updateField('acrescimo', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_final">Valor Final (R$)</Label>
              <Input
                id="valor_final"
                type="number"
                step="0.01"
                value={formData.valor_final}
                readOnly
                className="bg-gray-100 font-medium"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Ordem'}
        </Button>
      </div>
    </form>
  );
};
