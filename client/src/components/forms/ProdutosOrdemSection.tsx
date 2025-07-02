import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import { useProdutos } from '@/hooks/useProdutos';
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

interface ProdutosOrdemSectionProps {
  produtosUtilizados: ProdutoUtilizado[];
  onProdutosChange: (produtos: ProdutoUtilizado[]) => void;
}

export const ProdutosOrdemSection: React.FC<ProdutosOrdemSectionProps> = ({
  produtosUtilizados,
  onProdutosChange
}) => {
  const { produtos } = useProdutos();
  const [novoProduto, setNovoProduto] = useState<Partial<ProdutoUtilizado>>({
    tipo: 'produto',
    quantidade: 1,
    valor_unitario: 0
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularTotal = () => {
    return produtosUtilizados.reduce((total, item) => total + item.valor_total, 0);
  };

  const adicionarProduto = () => {
    if (novoProduto.tipo === 'produto' && !novoProduto.produto_id) {
      toast.error('Selecione um produto');
      return;
    }
    if (novoProduto.tipo === 'peca_avulsa' && !novoProduto.nome) {
      toast.error('Digite o nome da peça');
      return;
    }
    if (!novoProduto.quantidade || novoProduto.quantidade <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }
    if (!novoProduto.valor_unitario || novoProduto.valor_unitario <= 0) {
      toast.error('Valor unitário deve ser maior que zero');
      return;
    }

    let dadosProduto: ProdutoUtilizado;

    if (novoProduto.tipo === 'produto') {
      const produtoSelecionado = produtos.find(p => p.id === novoProduto.produto_id);
      if (!produtoSelecionado) {
        toast.error('Produto não encontrado');
        return;
      }
      
      dadosProduto = {
        id: `temp_${Date.now()}`,
        produto_id: produtoSelecionado.id,
        nome: produtoSelecionado.nome,
        categoria: produtoSelecionado.categoria,
        quantidade: novoProduto.quantidade!,
        valor_unitario: novoProduto.valor_unitario!,
        valor_total: novoProduto.quantidade! * novoProduto.valor_unitario!,
        tipo: 'produto'
      };
    } else {
      dadosProduto = {
        id: `temp_${Date.now()}`,
        nome: novoProduto.nome!,
        categoria: 'peca',
        quantidade: novoProduto.quantidade!,
        valor_unitario: novoProduto.valor_unitario!,
        valor_total: novoProduto.quantidade! * novoProduto.valor_unitario!,
        tipo: 'peca_avulsa'
      };
    }

    const novaListaProdutos = [...produtosUtilizados, dadosProduto];
    onProdutosChange(novaListaProdutos);
    
    // Limpar formulário
    setNovoProduto({
      tipo: 'produto',
      quantidade: 1,
      valor_unitario: 0
    });
    
    toast.success('Produto adicionado!');
  };

  const removerProduto = (index: number) => {
    const novaListaProdutos = produtosUtilizados.filter((_, i) => i !== index);
    onProdutosChange(novaListaProdutos);
    toast.success('Produto removido!');
  };

  const handleProdutoSelecionado = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setNovoProduto({
        ...novoProduto,
        produto_id: produtoId,
        valor_unitario: typeof produto.preco_venda === 'string' 
          ? parseFloat(produto.preco_venda) 
          : produto.preco_venda
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produtos e Serviços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de produtos adicionados */}
        {produtosUtilizados.length > 0 && (
          <div className="space-y-2">
            <Label className="font-medium">Itens Adicionados:</Label>
            {produtosUtilizados.map((item, index) => (
              <div key={item.id || index} className="p-3 border rounded-lg bg-gray-50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.nome}</span>
                  <Badge variant={item.categoria === 'peca' ? 'default' : 'secondary'}>
                    {item.categoria === 'peca' ? 'Peça' : 'Serviço'}
                  </Badge>
                  {item.tipo === 'peca_avulsa' && (
                    <Badge variant="outline">Avulsa</Badge>
                  )}
                </div>
                
                {/* Campos editáveis */}
                <div className="grid grid-cols-4 gap-3 items-end">
                  <div>
                    <Label className="text-xs">Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => {
                        const novaQuantidade = parseInt(e.target.value) || 1;
                        const novosItens = [...produtosUtilizados];
                        novosItens[index] = {
                          ...item,
                          quantidade: novaQuantidade,
                          valor_total: novaQuantidade * item.valor_unitario
                        };
                        onProdutosChange(novosItens);
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Valor Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.valor_unitario}
                      onChange={(e) => {
                        const novoValor = parseFloat(e.target.value) || 0;
                        const novosItens = [...produtosUtilizados];
                        novosItens[index] = {
                          ...item,
                          valor_unitario: novoValor,
                          valor_total: item.quantidade * novoValor
                        };
                        onProdutosChange(novosItens);
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Total</Label>
                    <div className="h-8 px-2 border rounded bg-white flex items-center text-sm">
                      {formatCurrency(item.valor_total)}
                    </div>
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removerProduto(index)}
                      className="text-red-600 hover:text-red-700 h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold">
                Total: {formatCurrency(calcularTotal())}
              </div>
            </div>
          </div>
        )}

        {/* Formulário para adicionar novo produto */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <Label className="font-medium">Adicionar Item:</Label>
          
          {/* Tipo de item */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Item</Label>
              <Select 
                value={novoProduto.tipo} 
                onValueChange={(value: 'produto' | 'peca_avulsa') => 
                  setNovoProduto({ ...novoProduto, tipo: value, produto_id: undefined, nome: undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produto">Produto Cadastrado</SelectItem>
                  <SelectItem value="peca_avulsa">Peça Avulsa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Produto ou nome da peça */}
          {novoProduto.tipo === 'produto' ? (
            <div>
              <Label>Produto</Label>
              <Select value={novoProduto.produto_id} onValueChange={handleProdutoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id!}>
                      {produto.nome} - {formatCurrency(
                        typeof produto.preco_venda === 'string' 
                          ? parseFloat(produto.preco_venda) 
                          : produto.preco_venda
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label>Nome da Peça</Label>
              <Input
                value={novoProduto.nome || ''}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                placeholder="Digite o nome da peça"
              />
            </div>
          )}

          {/* Quantidade e valor */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={novoProduto.quantidade || ''}
                onChange={(e) => setNovoProduto({ 
                  ...novoProduto, 
                  quantidade: parseInt(e.target.value) || 0 
                })}
              />
            </div>
            <div>
              <Label>Valor Unitário</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={novoProduto.valor_unitario || ''}
                onChange={(e) => setNovoProduto({ 
                  ...novoProduto, 
                  valor_unitario: parseFloat(e.target.value) || 0 
                })}
              />
            </div>
            <div>
              <Label>Total</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-gray-100 flex items-center">
                {formatCurrency((novoProduto.quantidade || 0) * (novoProduto.valor_unitario || 0))}
              </div>
            </div>
          </div>

          <Button type="button" onClick={adicionarProduto} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};