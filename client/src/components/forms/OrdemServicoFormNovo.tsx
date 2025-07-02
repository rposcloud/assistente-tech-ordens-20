import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ProdutosOrdemSection } from './ProdutosOrdemSection';

// Esquema de validação simples (apenas cliente obrigatório)
const formSchema = z.object({
  cliente_id: z.string().min(1, { message: 'Selecione um cliente' }),
  tipo_equipamento: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numero_serie: z.string().optional(),
  senha_equipamento: z.string().optional(),
  defeito_relatado: z.string().optional(),
  diagnostico_tecnico: z.string().optional(),
  solucao_aplicada: z.string().optional(),
  tecnico_responsavel: z.string().optional(),
  valor_mao_obra: z.string().optional(),
  valor_orcamento: z.string().optional(),
  desconto: z.string().optional(),
  acrescimo: z.string().optional(),
  garantia: z.number().optional(),
  status: z.string().optional(),
  prioridade: z.string().optional(),
  observacoes_internas: z.string().optional(),
});

interface OrdemServicoFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  loading?: boolean;
}

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

export const OrdemServicoFormNovo: React.FC<OrdemServicoFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false
}) => {
  const { toast } = useToast();
  const [produtosUtilizados, setProdutosUtilizados] = useState<ProdutoUtilizado[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
      status: initialData?.status || 'aberta',
      prioridade: initialData?.prioridade || 'normal',
      observacoes_internas: initialData?.observacoes_internas || ''
    },
  });

  // Buscar clientes
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['/api/clientes'],
  });

  // Carregar produtos utilizados quando initialData muda
  useEffect(() => {
    if (initialData) {
      const produtos: ProdutoUtilizado[] = [];

      // Adicionar produtos utilizados (produtos cadastrados)
      if (initialData.produtos_utilizados) {
        initialData.produtos_utilizados.forEach((item: any) => {
          produtos.push({
            id: item.id,
            produto_id: item.produto?.id || item.produto_id, // Garantir produto_id correto
            nome: item.produto?.nome || item.nome || 'Produto sem nome',
            categoria: item.produto?.categoria || 'peca',
            quantidade: item.quantidade,
            valor_unitario: parseFloat(item.valor_unitario) || 0,
            valor_total: parseFloat(item.valor_total) || 0,
            tipo: 'produto' as const
          });
        });
      }

      // Adicionar peças utilizadas (itens avulsos)
      if (initialData.pecas_utilizadas) {
        initialData.pecas_utilizadas.forEach((item: any) => {
          produtos.push({
            id: item.id,
            nome: item.nome,
            categoria: 'peca' as const,
            quantidade: item.quantidade,
            valor_unitario: parseFloat(item.valor_unitario) || 0,
            valor_total: parseFloat(item.valor_total) || 0,
            tipo: 'peca_avulsa' as const
          });
        });
      }

      setProdutosUtilizados(produtos);
    }
  }, [initialData]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    // Calcular valor total baseado nos produtos utilizados
    const totalProdutos = produtosUtilizados.reduce((total, produto) => total + produto.valor_total, 0);
    const valorMaoObra = parseFloat(values.valor_mao_obra || '0');
    const desconto = parseFloat(values.desconto || '0');
    const acrescimo = parseFloat(values.acrescimo || '0');
    
    const valorTotal = totalProdutos + valorMaoObra + acrescimo - desconto;

    const dadosOrdem = {
      ...values,
      valor_total: valorTotal.toString(),
      produtos_utilizados: produtosUtilizados,
      data_abertura: initialData?.data_abertura || new Date().toISOString(),
      historico_status: initialData?.historico_status || []
    };

    console.log('Submetendo dados da ordem:', dadosOrdem);
    onSubmit(dadosOrdem);
  };

  if (loadingClientes) {
    return <div>Carregando clientes...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        
        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(clientes as any[]).map((cliente: any) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome} - {cliente.telefone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informações do Equipamento */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Equipamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_equipamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Equipamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
              
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Apple, Samsung, Dell" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: iPhone 13, Galaxy S21" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numero_serie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de série do equipamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="senha_equipamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha do Equipamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Senha para acesso ao equipamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Descrição do Problema */}
        <Card>
          <CardHeader>
            <CardTitle>Descrição do Problema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="defeito_relatado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Defeito Relatado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o problema relatado pelo cliente"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnostico_tecnico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico Técnico</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Diagnóstico técnico do problema"
                      rows={3}
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
                      placeholder="Descreva a solução que foi aplicada"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <FormField
                control={form.control}
                name="tecnico_responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Técnico Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do técnico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="valor_mao_obra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mão de Obra</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="garantia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garantia (dias)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="aguardando_pecas">Aguardando Peças</SelectItem>
                      <SelectItem value="pronta">Pronta</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes_internas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações internas sobre o serviço"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
    </Form>
  );
};