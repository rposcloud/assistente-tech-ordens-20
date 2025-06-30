
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

  const totalClientes = clientes?.length || 0;
  const totalProdutos = produtos?.length || 0;
  const produtosAtivos = produtos?.filter((p: any) => p.ativo)?.length || 0;
  const produtosBaixoEstoque = produtos?.filter((p: any) => (p.estoque || 0) < 5)?.length || 0;
  
  // Cálculos financeiros
  const hoje = new Date();
  const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  const receitasDoMes = entradas?.filter(e => 
    e.tipo === 'receita' && 
    new Date(e.data_vencimento) >= primeiroDiaDoMes &&
    new Date(e.data_vencimento) <= hoje
  ) || [];
  
  const totalReceitaMes = receitasDoMes.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);
  
  // Estatísticas de ordens
  const ordensAbertas = ordens?.filter(o => o.status !== 'entregue')?.length || 0;
  const ordensEntregues = ordens?.filter(o => o.status === 'entregue')?.length || 0;

  const cards = [
    {
      title: 'Total de Clientes',
      value: loadingClientes ? '...' : totalClientes.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Produtos Ativos',
      value: loadingProdutos ? '...' : `${produtosAtivos}/${totalProdutos}`,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ordens Abertas',
      value: loadingOrdens ? '...' : `${ordensAbertas}`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Receita do Mês',
      value: loadingFinanceiro ? '...' : `R$ ${totalReceitaMes.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
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

      {/* Cards de Resumo */}
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

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Sistema integrado com PostgreSQL funcionando perfeitamente
              </div>
              <div className="text-sm text-gray-600">
                {totalClientes > 0 ? `${totalClientes} clientes cadastrados` : 'Nenhum cliente cadastrado ainda'}
              </div>
              <div className="text-sm text-gray-600">
                {totalProdutos > 0 ? `${totalProdutos} produtos no catálogo` : 'Nenhum produto cadastrado ainda'}
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
