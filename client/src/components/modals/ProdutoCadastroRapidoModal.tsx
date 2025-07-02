import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Produto } from '@shared/schema';
import { Package, Loader2 } from 'lucide-react';

interface ProdutoCadastroRapidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProdutoCreated: (produto: Produto) => void;
}

export const ProdutoCadastroRapidoModal: React.FC<ProdutoCadastroRapidoModalProps> = ({
  isOpen,
  onClose,
  onProdutoCreated
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: 'servico' as 'peca' | 'servico',
    preco_custo: '',
    preco_venda: '',
    tipo_equipamento: 'todos' as any,
    codigo: '',
    estoque: '',
    estoque_minimo: '',
    tempo_estimado: ''
  });

  const createProdutoMutation = useMutation({
    mutationFn: async (produtoData: any) => {
      const response = await apiRequest('/produtos', {
        method: 'POST',
        body: JSON.stringify(produtoData)
      });
      return response;
    },
    onSuccess: (produto: Produto) => {
      toast({
        title: "Produto/Serviço criado com sucesso!",
        description: `${produto.nome} foi adicionado à lista.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/produtos'] });
      onProdutoCreated(produto);
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto/serviço",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Criar produto mesmo com campos vazios (sem validações obrigatórias)
    const produtoData = {
      ...formData,
      // Garantir que pelo menos o nome tenha algo para identificação
      nome: formData.nome.trim() || 'Produto sem nome',
      // Converter valores numéricos ou deixar como string vazia
      preco_custo: formData.preco_custo || '0',
      preco_venda: formData.preco_venda || '0',
      estoque: formData.estoque ? parseInt(formData.estoque) : null,
      estoque_minimo: formData.estoque_minimo ? parseInt(formData.estoque_minimo) : null,
      tempo_estimado: formData.tempo_estimado ? parseInt(formData.tempo_estimado) : null,
    };
    
    createProdutoMutation.mutate(produtoData);
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: 'servico',
      preco_custo: '',
      preco_venda: '',
      tipo_equipamento: 'todos',
      codigo: '',
      estoque: '',
      estoque_minimo: '',
      tempo_estimado: ''
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Cadastro Rápido de Produto/Serviço
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome">Nome do Produto/Serviço</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Troca de Tela, Reparo Placa Mãe..."
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value: 'peca' | 'servico') => handleInputChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="peca">Peça</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Equipamento</Label>
              <Select 
                value={formData.tipo_equipamento} 
                onValueChange={(value) => handleInputChange('tipo_equipamento', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="notebook">Notebook</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco_custo">Preço de Custo</Label>
              <Input
                id="preco_custo"
                type="number"
                step="0.01"
                value={formData.preco_custo}
                onChange={(e) => handleInputChange('preco_custo', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco_venda">Preço de Venda</Label>
              <Input
                id="preco_venda"
                type="number"
                step="0.01"
                value={formData.preco_venda}
                onChange={(e) => handleInputChange('preco_venda', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Detalhes sobre o produto/serviço..."
                rows={3}
              />
            </div>
          </div>

          {/* Dados Adicionais (Opcional) */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Informações Adicionais (opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  placeholder="SKU123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoque">Estoque Atual</Label>
                <Input
                  id="estoque"
                  type="number"
                  value={formData.estoque}
                  onChange={(e) => handleInputChange('estoque', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  value={formData.estoque_minimo}
                  onChange={(e) => handleInputChange('estoque_minimo', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="tempo_estimado">Tempo Estimado (minutos)</Label>
                <Input
                  id="tempo_estimado"
                  type="number"
                  value={formData.tempo_estimado}
                  onChange={(e) => handleInputChange('tempo_estimado', e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createProdutoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createProdutoMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createProdutoMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar e Usar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};