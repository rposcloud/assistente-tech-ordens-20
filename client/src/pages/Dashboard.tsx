
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClientes } from '../hooks/useClientes';
import { useProdutos } from '../hooks/useProdutos';
import { useOrdens } from '../hooks/useOrdens';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const { profile } = useAuth();
  const { clientes, loading: loadingClientes } = useClientes();
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { ordens, loading: loadingOrdens } = useOrdens();
  const { entradas, loading: loadingFinanceiro } = useFinanceiro();
  
  // Debug: verificar dados financeiros
  console.log('Dados financeiros recebidos:', entradas);
  console.log('Loading financeiro:', loadingFinanceiro);

  const totalClientes = clientes?.length || 0;
  const totalProdutos = produtos?.length || 0;
  const produtosAtivos = produtos?.filter((p: any) => p.ativo)?.length || 0;
  const produtosBaixoEstoque = produtos?.filter((p: any) => (p.estoque || 0) < 5)?.length || 0;
  
  // Cálculos financeiros detalhados
  const hoje = new Date();
  const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  
  // Separar receitas e despesas
  const todasReceitas = entradas?.filter(e => e.tipo === 'receita') || [];
  const todasDespesas = entradas?.filter(e => e.tipo === 'despesa') || [];
  
  // Receitas do mês atual
  const receitasDoMes = todasReceitas.filter(e => {
    const dataEntrada = new Date(e.data_vencimento);
    return dataEntrada >= primeiroDiaDoMes && dataEntrada <= ultimoDiaDoMes;
  });
  
  // Despesas do mês atual
  const despesasDoMes = todasDespesas.filter(e => {
    const dataEntrada = new Date(e.data_vencimento);
    return dataEntrada >= primeiroDiaDoMes && dataEntrada <= ultimoDiaDoMes;
  });
  
  // Calcular totais
  const totalReceitaMes = receitasDoMes.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);
  
  const totalDespesaMes = despesasDoMes.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);
  
  const lucroMes = totalReceitaMes - totalDespesaMes;
  
  // Receitas pagas (status pago)
  const receitasPagas = receitasDoMes.filter(e => e.status === 'pago');
  const totalReceitaPaga = receitasPagas.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);
  
  // Receitas pendentes
  const receitasPendentes = receitasDoMes.filter(e => e.status === 'pendente');
  const totalReceitaPendente = receitasPendentes.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);
  
  // Estatísticas de ordens
  const ordensAbertas = ordens?.filter(o => o.status !== 'entregue')?.length || 0;
  const ordensEntregues = ordens?.filter(o => o.status === 'entregue')?.length || 0;

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
      title: 'Ordens Entregues',
      value: loadingOrdens ? '...' : `${ordensEntregues}`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {profile?.nome_completo || 'Usuário'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Aqui está um resumo do seu negócio hoje
        </p>
      </div>

      {/* Cards Financeiros - Primeira Linha */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Visão Financeira</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.slice(1, 5).map((card, index) => {
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

      {/* Cards Operacionais - Segunda Linha */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Visão Operacional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[cards[0], ...cards.slice(5)].map((card, index) => {
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

      {/* Alertas e Notificações */}
      {produtosBaixoEstoque > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertCircle className="mr-2 h-5 w-5" />
              Atenção: Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Você tem {produtosBaixoEstoque} produto(s) com estoque abaixo de 5 unidades.
              Considere fazer reposição.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resumo Detalhado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Resumo Financeiro do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Receitas Total:</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalReceitaMes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Receitas Pagas:</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(totalReceitaPaga)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">A Receber:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(totalReceitaPendente)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Despesas:</span>
                <span className="font-semibold text-red-600">{formatCurrency(totalDespesaMes)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Lucro Líquido:</span>
                  <span className={`font-bold ${lucroMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(lucroMes)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Status Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Sistema PostgreSQL funcionando perfeitamente
              </div>
              <div className="text-sm text-gray-600">
                {totalClientes > 0 ? `${totalClientes} clientes cadastrados` : 'Nenhum cliente cadastrado ainda'}
              </div>
              <div className="text-sm text-gray-600">
                {totalProdutos > 0 ? `${totalProdutos} produtos no catálogo` : 'Nenhum produto cadastrado ainda'}
              </div>
              <div className="text-sm text-gray-600">
                {ordensAbertas > 0 ? `${ordensAbertas} ordens em andamento` : 'Nenhuma ordem em andamento'}
              </div>
              <div className="text-sm text-gray-600">
                {ordensEntregues > 0 ? `${ordensEntregues} ordens finalizadas` : 'Nenhuma ordem finalizada ainda'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {totalClientes === 0 && (
                <div className="flex items-center text-blue-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Cadastre seus primeiros clientes
                </div>
              )}
              {totalProdutos === 0 && (
                <div className="flex items-center text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Adicione produtos e serviços
                </div>
              )}
              <div className="flex items-center text-purple-600">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                Crie ordens de serviço
              </div>
              <div className="flex items-center text-yellow-600">
                <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
                Configure o controle financeiro
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
