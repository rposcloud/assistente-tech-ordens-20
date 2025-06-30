import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useApiData } from '@/hooks/useApi';

interface GerenciarProdutosModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordemId: string;
  onProdutoAdded?: () => void;
}

export const GerenciarProdutosModal = ({ isOpen, onClose, ordemId, onProdutoAdded }: GerenciarProdutosModalProps) => {
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [valorUnitario, setValorUnitario] = useState('');
  
  // Para peças avulsas
  const [nomePeca, setNomePeca] = useState('');
  const [quantidadePeca, setQuantidadePeca] = useState('1');
  const [valorPeca, setValorPeca] = useState('');
  
  const [adicionandoProduto, setAdicionandoProduto] = useState(false);
  const [adicionandoPeca, setAdicionandoPeca] = useState(false);

  const { data: produtos = [], refetch: refetchProdutos } = useApiData('/api/produtos');

  const formatCurrency = (value: string) => {
    const number = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const handleAdicionarProduto = async () => {
    if (!produtoSelecionado || !quantidade || !valorUnitario) {
      toast.error('Preencha todos os campos do produto');
      return;
    }

    setAdicionandoProduto(true);
    try {
      const response = await fetch(`/api/ordens/${ordemId}/produtos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          produtoId: produtoSelecionado,
          quantidade: parseInt(quantidade),
          valorUnitario: parseFloat(valorUnitario)
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar produto');
      }

      toast.success('Produto adicionado com sucesso');
      setProdutoSelecionado('');
      setQuantidade('1');
      setValorUnitario('');
      onProdutoAdded?.();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
    } finally {
      setAdicionandoProduto(false);
    }
  };

  const handleAdicionarPeca = async () => {
    if (!nomePeca || !quantidadePeca || !valorPeca) {
      toast.error('Preencha todos os campos da peça');
      return;
    }

    setAdicionandoPeca(true);
    try {
      const response = await fetch(`/api/ordens/${ordemId}/pecas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nomePeca,
          quantidade: parseInt(quantidadePeca),
          valorUnitario: parseFloat(valorPeca)
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar peça');
      }

      toast.success('Peça adicionada com sucesso');
      setNomePeca('');
      setQuantidadePeca('1');
      setValorPeca('');
      onProdutoAdded?.();
    } catch (error) {
      console.error('Erro ao adicionar peça:', error);
      toast.error('Erro ao adicionar peça');
    } finally {
      setAdicionandoPeca(false);
    }
  };

  const handleProdutoChange = (produtoId: string) => {
    setProdutoSelecionado(produtoId);
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setValorUnitario(produto.preco_venda || produto.preco_custo || '0');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Produtos e Serviços</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="produtos">Produtos/Serviços</TabsTrigger>
            <TabsTrigger value="pecas">Peças Avulsas</TabsTrigger>
          </TabsList>

          <TabsContent value="produtos">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Produto/Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="produto">Produto/Serviço</Label>
                  <Select value={produtoSelecionado} onValueChange={handleProdutoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto ou serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome} - {produto.categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                    <Input
                      id="valorUnitario"
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorUnitario}
                      onChange={(e) => setValorUnitario(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {valorUnitario && quantidade && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-semibold text-lg">
                        {formatCurrency((parseFloat(valorUnitario) * parseInt(quantidade || '1')).toString())}
                      </span>
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleAdicionarProduto} 
                  disabled={adicionandoProduto || !produtoSelecionado || !quantidade || !valorUnitario}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {adicionandoProduto ? 'Adicionando...' : 'Adicionar Produto'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pecas">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Peça Avulsa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nomePeca">Nome da Peça</Label>
                  <Input
                    id="nomePeca"
                    value={nomePeca}
                    onChange={(e) => setNomePeca(e.target.value)}
                    placeholder="Ex: Tela LCD, Bateria, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantidadePeca">Quantidade</Label>
                    <Input
                      id="quantidadePeca"
                      type="number"
                      min="1"
                      value={quantidadePeca}
                      onChange={(e) => setQuantidadePeca(e.target.value)}
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valorPeca">Valor Unitário (R$)</Label>
                    <Input
                      id="valorPeca"
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorPeca}
                      onChange={(e) => setValorPeca(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {valorPeca && quantidadePeca && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-semibold text-lg">
                        {formatCurrency((parseFloat(valorPeca) * parseInt(quantidadePeca || '1')).toString())}
                      </span>
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleAdicionarPeca} 
                  disabled={adicionandoPeca || !nomePeca || !quantidadePeca || !valorPeca}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {adicionandoPeca ? 'Adicionando...' : 'Adicionar Peça'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};