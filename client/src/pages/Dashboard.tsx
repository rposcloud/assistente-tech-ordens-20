
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClientes } from '../hooks/useClientes';
import { useProdutos } from '../hooks/useProdutos';
import { useOrdens } from '../hooks/useOrdens';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit,
  Eye,
  MoreHorizontal,
  UserPlus,
  ShoppingCart,
  Calculator
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const Dashboard = () => {
  const { clientes, loading: loadingClientes } = useClientes();
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { ordens, loading: loadingOrdens } = useOrdens();
  const { entradas, loading: loadingFinanceiro } = useFinanceiro();
  
  // Cálculos básicos
  const totalClientes = clientes?.length || 0;
  const totalProdutos = produtos?.length || 0;
  const ordensAbertas = ordens?.filter(o => o.status !== 'finalizada')?.length || 0;
  
  // Cálculos financeiros
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const primeiroDiaDoMes = new Date(anoAtual, mesAtual, 1);
  const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0);

  const receitasDoMes = Array.isArray(entradas) ? entradas.filter((e: any) => {
    const dataVencimento = new Date(e.data_vencimento);
    return e.tipo === 'receita' && 
           dataVencimento >= primeiroDiaDoMes && 
           dataVencimento <= ultimoDiaDoMes;
  }) : [];

  const totalReceitaMes = receitasDoMes.reduce((acc, entrada) => {
    const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
    return acc + (valor || 0);
  }, 0);

  // Valor total das OS em aberto
  const valorTotalOSAbertas = ordens?.filter(o => o.status !== 'finalizada')
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

  const formatStatus = (status: string) => {
    const statusMap = {
      'aberta': 'Aberta',
      'em_andamento': 'Em Andamento',
      'aguardando_pecas': 'Aguardando Peças',
      'pronta': 'Pronta',
      'finalizada': 'Finalizada'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'aberta': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'aguardando_pecas': 'bg-orange-100 text-orange-800',
      'pronta': 'bg-green-100 text-green-800',
      'finalizada': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  // Últimas 5 ordens de serviço
  const ultimasOrdens = ordens?.slice(0, 5) || [];

  const quickActions = [
    {
      title: 'Nova Ordem de Serviço',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      link: '/ordens'
    },
    {
      title: 'Novo Cliente',
      icon: UserPlus,
      color: 'bg-green-600 hover:bg-green-700', 
      link: '/clientes'
    },
    {
      title: 'Novo Produto',
      icon: ShoppingCart,
      color: 'bg-purple-600 hover:bg-purple-700',
      link: '/produtos'
    },
    {
      title: 'Financeiro',
      icon: Calculator,
      color: 'bg-orange-600 hover:bg-orange-700',
      link: '/financeiro'
    }
  ];

  const cards = [
    {
      title: 'Total de Clientes',
      value: loadingClientes ? '...' : totalClientes.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Produtos Cadastrados',
      value: loadingProdutos ? '...' : totalProdutos.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Ordens Abertas',
      value: loadingOrdens ? '...' : ordensAbertas.toString(),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Receita do Mês',
      value: loadingFinanceiro ? '...' : formatCurrency(totalReceitaMes),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Valor OS Abertas',
      value: loadingOrdens ? '...' : formatCurrency(valorTotalOSAbertas),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>
      </div>

      {/* Cards Principais - Menores */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-3 w-3 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-gray-900">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.link}>
                  <Button className={`w-full h-16 ${action.color} text-white flex flex-col gap-2`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{action.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Últimas Ordens de Serviço */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Últimas Ordens de Serviço
          </CardTitle>
          <Link to="/ordens">
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingOrdens ? (
            <div className="text-center py-4">
              <div className="text-gray-600">Carregando ordens...</div>
            </div>
          ) : ultimasOrdens.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma ordem de serviço encontrada</p>
              <Link to="/ordens">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira OS
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimasOrdens.map((ordem: any) => (
                    <TableRow key={ordem.id}>
                      <TableCell className="font-medium">
                        #{ordem.numero}
                      </TableCell>
                      <TableCell>{ordem.cliente_nome}</TableCell>
                      <TableCell className="capitalize">
                        {ordem.tipo_equipamento}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ordem.status)}`}>
                          {formatStatus(ordem.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(parseFloat(ordem.valor_total || '0'))}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/ordens?view=${ordem.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/ordens?edit=${ordem.id}`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
