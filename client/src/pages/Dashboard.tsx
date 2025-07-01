
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClientes } from '../hooks/useClientes';
import { useProdutos } from '../hooks/useProdutos';
import { useOrdens } from '../hooks/useOrdens';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { useProfile } from '../hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, FileText, DollarSign, TrendingUp, AlertCircle, Calculator } from 'lucide-react';

export const Dashboard = () => {
  const { profile } = useAuth();
  const { companyProfile } = useProfile();
  const { clientes, loading: loadingClientes } = useClientes();
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { ordens, loading: loadingOrdens } = useOrdens();
  const { entradas, loading: loadingFinanceiro } = useFinanceiro();
  


  const totalClientes = clientes?.length || 0;
  const totalProdutos = produtos?.length || 0;
  const produtosAtivos = produtos?.filter((p: any) => p.ativo)?.length || 0;
  const produtosBaixoEstoque = produtos?.filter((p: any) => (p.estoque || 0) < 5)?.length || 0;
  
  // Cálculos financeiros detalhados
  const hoje = new Date();
  console.log('Dados financeiros recebidos:', entradas);
  console.log('Loading financeiro:', loadingFinanceiro);
  
  // Separar receitas e despesas pagas
  const todasReceitas = Array.isArray(entradas) ? entradas.filter((e: any) => e.tipo === 'receita' && e.status === 'pago') : [];
  const todasDespesas = Array.isArray(entradas) ? entradas.filter((e: any) => e.tipo === 'despesa' && e.status === 'pago') : [];
  
  // Mostrar dados dos últimos 6 meses para garantir que apareça algo
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Para demonstração: mostrar TODAS as receitas e despesas pagas
  const receitasDoMes = todasReceitas; // Mostrar todas para teste
  const despesasDoMes = todasDespesas; // Mostrar todas para teste
  
  // Calcular totais
  const totalReceitaMes = receitasDoMes.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);
  
  const totalDespesaMes = despesasDoMes.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);

  console.log('Total receita mês:', totalReceitaMes);
  console.log('Total despesa mês:', totalDespesaMes);
  console.log('Receitas do mês:', receitasDoMes);
  console.log('Despesas do mês:', despesasDoMes);

  // Debug das datas
  console.log('Data atual:', hoje);
  console.log('Primeiro dia do mês:', new Date(anoAtual, mesAtual, 1));
  console.log('Último dia do mês:', new Date(anoAtual, mesAtual + 1, 0));
  
  const lucroMes = totalReceitaMes - totalDespesaMes;
  
  // Receitas pagas (status pago)
  const receitasPagas = receitasDoMes.filter((e: any) => e.status === 'pago');
  const totalReceitaPaga = receitasPagas.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);
  
  // Receitas pendentes
  const receitasPendentes = receitasDoMes.filter((e: any) => e.status === 'pendente');
  const totalReceitaPendente = receitasPendentes.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);
  
  // Debug: verificar dados financeiros
  console.log('Dados financeiros recebidos:', entradas);
  console.log('Loading financeiro:', loadingFinanceiro);
  console.log('Total receita mês:', totalReceitaMes);
  console.log('Total despesa mês:', totalDespesaMes);
  console.log('Receitas do mês:', receitasDoMes);
  console.log('Despesas do mês:', despesasDoMes);
  console.log('Data atual:', hoje);
  console.log('Primeiro dia do mês:', new Date(anoAtual, mesAtual, 1));
  console.log('Último dia do mês:', new Date(anoAtual, mesAtual + 1, 0));
  
  // Estatísticas de ordens
  const ordensAbertas = ordens?.filter(o => o.status !== 'entregue')?.length || 0;
  const ordensEntregues = ordens?.filter(o => o.status === 'entregue')?.length || 0;
  
  // Valor total das OS em aberto
  const valorTotalOSAbertas = ordens?.filter(o => o.status !== 'entregue')
    .reduce((acc, ordem) => {
      const valor = typeof ordem.valor_total === 'string' ? parseFloat(ordem.valor_total) : ordem.valor_total;
      return acc + (valor || 0);
    }, 0) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Total de Clientes',
      value: loadingClientes ? '...' : totalClientes.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Receita do Mês',
      value: loadingFinanceiro ? '...' : formatCurrency(totalReceitaMes),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Despesas do Mês',
      value: loadingFinanceiro ? '...' : formatCurrency(totalDespesaMes),
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Lucro do Mês',
      value: loadingFinanceiro ? '...' : formatCurrency(lucroMes),
      icon: TrendingUp,
      color: lucroMes >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: lucroMes >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Receita Paga',
      value: loadingFinanceiro ? '...' : formatCurrency(totalReceitaPaga),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'A Receber',
      value: loadingFinanceiro ? '...' : formatCurrency(totalReceitaPendente),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Ordens Abertas',
      value: loadingOrdens ? '...' : `${ordensAbertas}`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Valor OS Abertas',
      value: loadingOrdens ? '...' : formatCurrency(valorTotalOSAbertas),
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Ordens Entregues',
      value: loadingOrdens ? '...' : `${ordensEntregues}`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards Principais - Informações Relevantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      </div>
  );
};
