import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrdemServicoSchema } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, UserPlus, Package } from "lucide-react";
import { apiRequest } from "../lib/api";
import { Badge } from "@/components/ui/badge";
import { ClienteCadastroRapidoModal } from "@/components/modals/ClienteCadastroRapidoModal";
import { ProdutoCadastroRapidoModal } from "@/components/modals/ProdutoCadastroRapidoModal";

type ProdutoSelecionado = {
  id: string;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  categoria: string;
};

const tipoEquipamentoOptions = [
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'notebook', label: 'Notebook' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'outros', label: 'Outros' },
  { value: 'todos', label: 'Todos' }
];

export function NovaOrdem() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [showCadastroRapido, setShowCadastroRapido] = useState(false);
  const [showCadastroProduto, setShowCadastroProduto] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertOrdemServicoSchema.extend({
      valor_total: insertOrdemServicoSchema.shape.valor_total.optional(),
      status: insertOrdemServicoSchema.shape.status.optional(),
    })),
    defaultValues: {
      cliente_id: '',
      tipo_equipamento: '' as any,
      defeito_relatado: '',
      solucao_aplicada: '',
      observacoes: '',
      valor_total: '0',
      status: 'aberta' as any,
    },
  });

  // Buscar clientes
  const { data: clientes = [] } = useQuery({
    queryKey: ['/api/clientes'],
  });

  // Buscar produtos
  const { data: produtos = [] } = useQuery({
    queryKey: ['/api/produtos'],
  });

  // Calcular valor total baseado nos produtos selecionados
  const valorTotal = produtosSelecionados.reduce(
    (total, produto) => total + (produto.quantidade * produto.valor_unitario), 0
  );

  // Atualizar valor total no formulário
  form.setValue('valor_total', valorTotal.toString());

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/ordens', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
      toast({
        title: "Sucesso",
        description: "Ordem de serviço criada com sucesso!",
      });
      navigate('/ordens');
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar ordem de serviço",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const ordemData = {
      ...data,
      valor_total: parseFloat(data.valor_total || '0'),
      produtos_utilizados: produtosSelecionados.map(p => ({
        produto_id: p.id,
        quantidade: p.quantidade,
        valor_unitario: p.valor_unitario
      })),
    };
    createMutation.mutate(ordemData);
  };

  const adicionarProduto = () => {
    const produto = produtos.find((p: any) => p.id === produtoSelecionado);
    if (!produto) return;

    const produtoExistente = produtosSelecionados.find(p => p.id === produto.id);
    if (produtoExistente) {
      setProdutosSelecionados(prev => 
        prev.map(p => p.id === produto.id 
          ? { ...p, quantidade: p.quantidade + 1 }
          : p
        )
      );
    } else {
      const novoProduto: ProdutoSelecionado = {
        id: produto.id,
        nome: produto.nome,
        quantidade: 1,
        valor_unitario: parseFloat(produto.preco_venda),
        categoria: produto.categoria
      };
      setProdutosSelecionados(prev => [...prev, novoProduto]);
    }
    setProdutoSelecionado('');
  };

  const removerProduto = (index: number) => {
    setProdutosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) return;
    setProdutosSelecionados(prev => 
      prev.map((produto, i) => 
        i === index ? { ...produto, quantidade: novaQuantidade } : produto
      )
    );
  };

  const handleClienteCreated = (cliente: any) => {
    // Atualiza a lista de clientes no cache
    queryClient.invalidateQueries({ queryKey: ['/api/clientes'] });
    // Seleciona automaticamente o novo cliente
    form.setValue('cliente_id', cliente.id);
    // Fecha o modal
    setShowCadastroRapido(false);
  };

  const handleProdutoCreated = (produto: any) => {
    // Atualiza a lista de produtos no cache
    queryClient.invalidateQueries({ queryKey: ['/api/produtos'] });
    // Seleciona automaticamente o novo produto
    setProdutoSelecionado(produto.id);
    // Fecha o modal
    setShowCadastroProduto(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/ordens')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Nova Ordem de Serviço</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Ordem</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cliente_id"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Cliente *</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCadastroRapido(true)}
                            className="flex items-center gap-1 text-xs"
                          >
                            <UserPlus className="h-3 w-3" />
                            Novo Cliente
                          </Button>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientes.map((cliente: any) => (
                              <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_equipamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Equipamento *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tipoEquipamentoOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defeito_relatado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Defeito Relatado *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o problema relatado pelo cliente"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="solucao_aplicada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Solução Aplicada</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva a solução aplicada (opcional)"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observações adicionais (opcional)"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/ordens')}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="flex-1"
                    >
                      {createMutation.isPending ? "Criando..." : "Criar Ordem"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Produtos/Serviços */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Produtos/Serviços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adicionar Produto */}
              <div className="flex gap-2">
                <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto: any) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} - R$ {parseFloat(produto.preco_venda).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCadastroProduto(true)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={adicionarProduto}
                  disabled={!produtoSelecionado}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Lista de Produtos Selecionados */}
              <div className="space-y-2">
                {produtosSelecionados.map((produto, index) => (
                  <div key={`${produto.id}-${index}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{produto.nome}</span>
                        <Badge variant={produto.categoria === 'peca' ? 'default' : 'secondary'}>
                          {produto.categoria === 'peca' ? 'Peça' : 'Serviço'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        R$ {produto.valor_unitario.toFixed(2)} cada
                      </div>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={produto.quantidade}
                      onChange={(e) => atualizarQuantidade(index, parseInt(e.target.value) || 1)}
                      className="w-16 h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerProduto(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Valor Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Valor Total:</span>
                  <span className="text-lg">R$ {valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modais de Cadastro Rápido */}
      <ClienteCadastroRapidoModal
        isOpen={showCadastroRapido}
        onClose={() => setShowCadastroRapido(false)}
        onClienteCreated={handleClienteCreated}
      />
      
      <ProdutoCadastroRapidoModal
        isOpen={showCadastroProduto}
        onClose={() => setShowCadastroProduto(false)}
        onProdutoCreated={handleProdutoCreated}
      />
    </div>
  );
}