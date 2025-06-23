import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Users, Package } from 'lucide-react';
import { OrdemServico, Cliente, Produto } from '../types';
import { formatCurrency } from '../utils/masks';
import { SortableTable, Column } from '../components/ui/sortable-table';
import { FinancialEntryModal } from '../components/financial/FinancialEntryModal';

interface FinancialData {
  receita: number;
  despesa: number;
  lucro: number;
  ordens: number;
  ticket: number;
}

interface OrderFinancial extends OrdemServico {
  cliente: Cliente;
  lucroCalculado: number;
  fonte: 'OS';
}

interface FinancialEntry {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  categoria: string;
  formaPagamento: string;
  dataVencimento: string;
  status: 'pendente' | 'pago';
  observacoes?: string;
}

interface FinancialEntryWithSource extends FinancialEntry {
  fonte: 'entrada';
  cliente?: { nome: string };
  numero?: string;
  dataAbertura?: string;
  lucroCalculado?: number;
}

type UnifiedFinancialItem = OrderFinancial | FinancialEntryWithSource;

export const Financeiro = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [periodo, setPeriodo] = useState('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>([]);

  useEffect(() => {
    const ordensSalvas = localStorage.getItem('ordens');
    const clientesSalvos = localStorage.getItem('clientes');
    const produtosSalvos = localStorage.getItem('produtos');
    const entradaFinanceira = localStorage.getItem('financialEntries');
    
    if (ordensSalvas) {
      setOrdens(JSON.parse(ordensSalvas));
    }
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
    if (produtosSalvos) {
      setProdutos(JSON.parse(produtosSalvos));
    }
    if (entradaFinanceira) {
      setFinancialEntries(JSON.parse(entradaFinanceira));
    }

    // Definir período padrão (mês atual)
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    setDataInicio(inicioMes.toISOString().split('T')[0]);
    setDataFim(fimMes.toISOString().split('T')[0]);
  }, []);

  const handleSaveFinancialEntry = (entry: FinancialEntry) => {
    const updatedEntries = [...financialEntries, entry];
    setFinancialEntries(updatedEntries);
    localStorage.setItem('financialEntries', JSON.stringify(updatedEntries));
  };

  const calcularCustoReal = (ordem: OrdemServico): number => {
    let custoTotal = 0;

    // Calcular custo das peças utilizadas (sistema antigo)
    if (ordem.pecasUtilizadas) {
      custoTotal += ordem.pecasUtilizadas.reduce((total, peca) => {
        return total + (peca.valorUnitario * peca.quantidade * 0.7); // Fallback para peças antigas
      }, 0);
    }

    // Calcular custo dos produtos utilizados (sistema novo)
    if (ordem.produtosUtilizados) {
      custoTotal += ordem.produtosUtilizados.reduce((total, produtoUtilizado) => {
        const produto = produtos.find(p => p.id === produtoUtilizado.produtoId);
        const precoCusto = produto ? produto.precoCusto : produtoUtilizado.valorUnitario * 0.7;
        return total + (precoCusto * produtoUtilizado.quantidade);
      }, 0);
    }

    return custoTotal;
  };

  const ordensFiltradas = ordens.filter(ordem => {
    if (!dataInicio || !dataFim) return true;
    
    const dataOrdem = new Date(ordem.dataAbertura);
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    return dataOrdem >= inicio && dataOrdem <= fim;
  });

  const entradasFiltradas = financialEntries.filter(entrada => {
    if (!dataInicio || !dataFim) return true;
    
    const dataEntrada = new Date(entrada.dataVencimento);
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    return dataEntrada >= inicio && dataEntrada <= fim && entrada.status === 'pago';
  });

  const ordensFinalizadas = ordensFiltradas.filter(ordem => ordem.finalizada && ordem.statusPagamento === 'pago');

  const receitaOrdens = ordensFinalizadas.reduce((acc, ordem) => acc + (ordem.valorFinal || ordem.valorTotal || 0), 0);
  const receitaEntradas = entradasFiltradas.filter(e => e.tipo === 'receita').reduce((acc, entrada) => acc + entrada.valor, 0);
  const despesaEntradas = entradasFiltradas.filter(e => e.tipo === 'despesa').reduce((acc, entrada) => acc + entrada.valor, 0);

  const calculosFinanceiros: FinancialData = {
    receita: receitaOrdens + receitaEntradas,
    despesa: despesaEntradas,
    lucro: (receitaOrdens + receitaEntradas) - despesaEntradas - ordensFinalizadas.reduce((acc, ordem) => {
      return acc + calcularCustoReal(ordem);
    }, 0),
    ordens: ordensFinalizadas.length,
    ticket: ordensFinalizadas.length > 0 ? receitaOrdens / ordensFinalizadas.length : 0
  };

  const ordensComClientes: OrderFinancial[] = ordensFinalizadas.map(ordem => {
    const cliente = clientes.find(c => c.id === ordem.clienteId);
    const custoReal = calcularCustoReal(ordem);
    const lucroCalculado = (ordem.valorFinal || ordem.valorTotal || 0) - custoReal;
    
    return {
      ...ordem,
      cliente: cliente!,
      lucroCalculado,
      fonte: 'OS' as const
    };
  });

  const entradasComFonte: FinancialEntryWithSource[] = entradasFiltradas.map(entrada => ({
    ...entrada,
    fonte: 'entrada' as const,
    cliente: { nome: 'N/A' },
    numero: entrada.tipo === 'receita' ? 'REC' : 'DESP',
    dataAbertura: entrada.dataVencimento,
    lucroCalculado: entrada.tipo === 'receita' ? entrada.valor : -entrada.valor
  }));

  const dadosUnificados: UnifiedFinancialItem[] = [...ordensComClientes, ...entradasComFonte];

  const colunas: Column<UnifiedFinancialItem>[] = [
    {
      key: 'fonte',
      label: 'Tipo',
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          item.fonte === 'OS' ? 'bg-blue-100 text-blue-800' : 
          (item as FinancialEntryWithSource).tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.fonte === 'OS' ? 'OS' : (item as FinancialEntryWithSource).tipo === 'receita' ? 'REC' : 'DESP'}
        </span>
      )
    },
    {
      key: 'numero',
      label: 'Número',
      render: (item) => item.fonte === 'OS' ? `#${item.numero}` : `${item.numero}-${item.id.slice(-4)}`
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (item) => item.fonte === 'OS' ? `${item.marca} ${item.modelo}` : (item as FinancialEntryWithSource).descricao
    },
    {
      key: 'cliente.nome',
      label: 'Cliente',
      render: (item) => item.cliente?.nome || 'N/A'
    },
    {
      key: 'dataAbertura',
      label: 'Data',
      render: (item) => new Date(item.dataAbertura || item.dataVencimento).toLocaleDateString('pt-BR')
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (item) => {
        const valor = item.fonte === 'OS' ? (item.valorFinal || item.valorTotal || 0) : (item as FinancialEntryWithSource).valor;
        const isNegative = item.fonte === 'entrada' && (item as FinancialEntryWithSource).tipo === 'despesa';
        return (
          <span className={isNegative ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
            {isNegative ? '-' : ''}{formatCurrency(valor)}
          </span>
        );
      },
      className: 'text-right'
    },
    {
      key: 'formaPagamento',
      label: 'Pagamento',
      render: (item) => {
        const formasPagamento = {
          dinheiro: '💵 Dinheiro',
          cartao_credito: '💳 Crédito',
          cartao_debito: '💳 Débito',
          pix: '📱 PIX',
          transferencia: '🏦 Transferência',
          parcelado: '📊 Parcelado',
          boleto: '📄 Boleto'
        };
        return formasPagamento[item.formaPagamento as keyof typeof formasPagamento] || item.formaPagamento;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DollarSign className="mr-3 text-green-600" size={32} />
            Módulo Financeiro
          </h1>
          <p className="text-gray-600">Controle financeiro e relatórios</p>
        </div>
        <FinancialEntryModal onSave={handleSaveFinancialEntry} />
      </div>

      {/* Filtros de Período */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="mr-2 text-blue-600" size={20} />
          Filtros de Período
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={periodo}
              onChange={(e) => {
                setPeriodo(e.target.value);
                const hoje = new Date();
                if (e.target.value === 'mes') {
                  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                  setDataInicio(inicioMes.toISOString().split('T')[0]);
                  setDataFim(fimMes.toISOString().split('T')[0]);
                } else if (e.target.value === 'ano') {
                  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
                  const fimAno = new Date(hoje.getFullYear(), 11, 31);
                  setDataInicio(inicioAno.toISOString().split('T')[0]);
                  setDataFim(fimAno.toISOString().split('T')[0]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="personalizado">Personalizado</option>
              <option value="mes">Mês Atual</option>
              <option value="ano">Ano Atual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Receita Total</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(calculosFinanceiros.receita)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Despesa Total</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(calculosFinanceiros.despesa)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Lucro Líquido</p>
              <p className={`text-lg font-bold ${calculosFinanceiros.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculosFinanceiros.lucro)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Ordens Pagas</p>
              <p className="text-lg font-bold text-gray-900">{calculosFinanceiros.ordens}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Ticket Médio</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(calculosFinanceiros.ticket)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Unificada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="mr-2 text-blue-600" size={20} />
            Movimentação Financeira no Período
          </h3>
        </div>
        <div className="p-6">
          <SortableTable
            data={dadosUnificados}
            columns={colunas}
            keyExtractor={(item) => `${item.fonte}-${item.id}`}
            emptyMessage="Nenhuma movimentação financeira no período"
            emptyIcon={<DollarSign size={48} className="text-gray-300" />}
          />
        </div>
      </div>
    </div>
  );
};
