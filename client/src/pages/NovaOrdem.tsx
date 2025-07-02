import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrdemServicoSchema } from "@shared/schema";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, UserPlus, Package } from "lucide-react";
import { apiRequestWithMethod } from "../lib/api";
import { ClienteCadastroRapidoModal } from "@/components/modals/ClienteCadastroRapidoModal";
import { ProdutoCadastroRapidoModal } from "@/components/modals/ProdutoCadastroRapidoModal";

type ProdutoSelecionado = {
  id: string;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  categoria: string;
};

export function NovaOrdem() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [showCadastroRapido, setShowCadastroRapido] = useState(false);
  const [showCadastroProduto, setShowCadastroProduto] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertOrdemServicoSchema.extend({
      // Apenas cliente obrigatório
      cliente_id: z.string().min(1, "Cliente é obrigatório"),
      // Todos os outros campos opcionais
      marca: z.string().optional(),
      modelo: z.string().optional(),
      tipo_equipamento: z.string().optional(),
      defeito_relatado: z.string().optional(),
      valor_total: z.string().optional(),
      valor_avulso: z.string().optional(),
      desconto: z.string().optional(),
      status: z.string().optional(),
    })),
    defaultValues: {
      cliente_id: '',
      tipo_equipamento: '',
      marca: '',
      modelo: '',
      defeito_relatado: '',
      solucao_aplicada: '',
      observacoes: '',
      valor_total: '0',
      valor_avulso: '0',
      desconto: '0',
      status: 'aberta',
    },
  });

  // Buscar clientes
  const { data: clientes = [], isLoading: loadingClientes, error: errorClientes } = useQuery({
    queryKey: ['/clientes'],
  });

  // Buscar produtos
  const { data: produtos = [], isLoading: loadingProdutos, error: errorProdutos } = useQuery({
    queryKey: ['/produtos'],
  });

  // Calcular valor total baseado nos produtos selecionados + valor avulso - desconto
  const valorProdutos = produtosSelecionados.reduce(
    (total, produto) => total + (produto.quantidade * produto.valor_unitario), 0
  );
  
  const valorAvulso = parseFloat(form.watch('valor_avulso') || '0');
  const desconto = parseFloat(form.watch('desconto') || '0');
  const valorTotal = valorProdutos + valorAvulso - desconto;

  // Atualizar valor total no formulário
  form.setValue('valor_total', valorTotal.toString());

  // Função para adicionar produto
  const adicionarProduto = () => {
    if (!produtoSelecionado) return;
    
    const produto = (produtos as any)?.find((p: any) => p.id === produtoSelecionado);
    if (!produto) return;
    
    const novoProduto: ProdutoSelecionado = {
      id: produto.id,
      nome: produto.nome,
      quantidade: quantidade,
      valor_unitario: parseFloat(produto.preco_venda),
      categoria: produto.categoria
    };
    
    setProdutosSelecionados(prev => [...prev, novoProduto]);
    setProdutoSelecionado('');
    setQuantidade(1);
  };

  // Função para remover produto
  const removerProduto = (index: number) => {
    setProdutosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequestWithMethod('/ordens', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/ordens'] });
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

  // Handlers para modals
  const handleClienteCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['/clientes'] });
  };

  const handleProdutoCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['/produtos'] });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/ordens')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">
            Criar uma nova ordem de serviço
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Formulário Principal */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informações da Ordem</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Cliente */}
                  <FormField
                    control={form.control}
                    name="cliente_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente *</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecione um cliente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(clientes as any)?.map((cliente: any) => (
                                <SelectItem key={cliente.id} value={cliente.id}>
                                  {cliente.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCadastroRapido(true)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tipo de Equipamento */}
                  <FormField
                    control={form.control}
                    name="tipo_equipamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Equipamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="smartphone">Smartphone</SelectItem>
                            <SelectItem value="notebook">Notebook</SelectItem>
                            <SelectItem value="desktop">Desktop</SelectItem>
                            <SelectItem value="tablet">Tablet</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Marca */}
                  <FormField
                    control={form.control}
                    name="marca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Samsung, Apple, Dell, etc."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Modelo */}
                  <FormField
                    control={form.control}
                    name="modelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Galaxy S21, iPhone 12, Inspiron 15, etc."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Defeito Relatado */}
                  <FormField
                    control={form.control}
                    name="defeito_relatado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Defeito Relatado</FormLabel>
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

                  {/* Solução Aplicada */}
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

                  {/* Observações */}
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

                  {/* Seção de Produtos */}
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Produtos e Serviços</h3>
                    
                    <div className="space-y-4">
                      {/* Lista de produtos selecionados */}
                      {produtosSelecionados.length > 0 && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3">Produtos Selecionados</h4>
                          <div className="space-y-2">
                            {produtosSelecionados.map((produto, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div className="flex-1">
                                  <span className="font-medium">{produto.nome}</span>
                                  <span className="ml-2 text-sm text-gray-600">
                                    {produto.quantidade}x R$ {produto.valor_unitario.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    R$ {(produto.quantidade * produto.valor_unitario).toFixed(2)}
                                  </span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removerProduto(index)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Adicionar produtos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Produto</Label>
                          <div className="flex gap-2">
                            <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {(produtos as any)?.map((produto: any) => (
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
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label>Quantidade</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={quantidade}
                              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                              placeholder="1"
                            />
                            <Button
                              type="button"
                              onClick={adicionarProduto}
                              disabled={!produtoSelecionado}
                            >
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Valores Adicionais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <FormField
                      control={form.control}
                      name="valor_avulso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Avulso</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="desconto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desconto</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Valor Total */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Valor Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        R$ {valorTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

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