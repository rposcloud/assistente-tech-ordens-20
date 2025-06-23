
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Users, Package } from 'lucide-react';
import { OrdemServico, Cliente } from '../types';
import { formatCurrency } from '../utils/masks';
import { SortableTable, Column } from '../components/ui/sortable-table';

interface FinancialData {
  receita: number;
  lucro: number;
  ordens: number;
  ticket: number;
}

interface OrderFinancial extends OrdemServico {
  cliente: Cliente;
  lucroCalculado: number;
}

export const Financeiro = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [periodo, setPeriodo] = useState('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const ordensSalvas = localStorage.getItem('ordens');
    const clientesSalvos = localStorage.getItem('clientes');
    
    if (ordensSalvas) {
      setOrdens(JSON.parse(ordensSalvas));
    }
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }

    // Definir período padrão (mês atual)
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    setDataInicio(inicioMes.toISOString().split('T')[0]);
    setDataFim(fimMes.toISOString().split('T')[0]);
  }, []);

  const ordensFiltradas = ordens.filter(ordem => {
    if (!dataInicio || !dataFim) return true;
    
    const dataOrdem = new Date(ordem.dataAbertura);
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    return dataOrdem >= inicio && dataOrdem <= fim;
  });

  const ordensFinalizadas = ordensFiltradas.filter(ordem => ordem.finalizada && ordem.statusPagamento === 'pago');

  const calculosFinanceiros: FinancialData = {
    receita: ordensFinalizadas.reduce((acc, ordem) => acc + (ordem.valorFinal || ordem.valorTotal || 0), 0),
    lucro: ordensFinalizadas.reduce((acc, ordem) => {
      const custosPecas = (ordem.pecasUtilizadas || []).reduce((total, peca) => total + (peca.valorUnitario * peca.quantidade * 0.7), 0); // 30% de margem nas peças
      const lucroOrdem = (ordem.valorFinal || ordem.valorTotal || 0) - custosPecas;
      return acc + lucroOrdem;
    }, 0),
    ordens: ordensFinalizadas.length,
    ticket: ordensFinalizadas.length > 0 ? ordensFinalizadas.reduce((acc, ordem) => acc + (ordem.valorFinal || ordem.valorTotal || 0), 0) / ordensFinalizadas.length : 0
  };

  const ordensComClientes: OrderFinancial[] = ordensFinalizadas.map(ordem => {
    const cliente = clientes.find(c => c.id === ordem.clienteId);
    const custosPecas = (ordem.pecasUtilizadas || []).reduce((total, peca) => total + (peca.valorUnitario * peca.quantidade * 0.7), 0);
    const lucroCalculado = (ordem.valorFinal || ordem.valorTotal || 0) - custosPecas;
    
    return {
      ...ordem,
      cliente: cliente!,
      lucroCalculado
    };
  });

  const colunas: Column<OrderFinancial>[] = [
    {
      key: 'numero',
      label: 'OS',
      render: (ordem) => `#${ordem.numero}`
    },
    {
      key: 'cliente.nome',
      label: 'Cliente',
      render: (ordem) => ordem.cliente?.nome || 'N/A'
    },
    {
      key: 'dataAbertura',
      label: 'Data',
      render: (ordem) => new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')
    },
    {
      key: 'valorFinal',
      label: 'Receita',
      render: (ordem) => formatCurrency(ordem.valorFinal || ordem.valorTotal || 0),
      className: 'text-right'
    },
    {
      key: 'lucroCalculado',
      label: 'Lucro Est.',
      render: (ordem) => (
        <span className={`font-medium ${ordem.lucroCalculado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(ordem.lucroCalculado)}
        </span>
      ),
      className: 'text-right'
    },
    {
      key: 'formaPagamento',
      label: 'Pagamento',
      render: (ordem) => {
        const formasPagamento = {
          dinheiro: '💵 Dinheiro',
          cartao_credito: '💳 Crédito',
          cartao_debito: '💳 Débito',
          pix: '📱 PIX',
          transferencia: '🏦 Transferência',
          parcelado: '📊 Parcelado'
        };
        return formasPagamento[ordem.formaPagamento as keyof typeof formasPagamento] || ordem.formaPagamento;
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
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculosFinanceiros.receita)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lucro Estimado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculosFinanceiros.lucro)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ordens Pagas</p>
              <p className="text-2xl font-bold text-gray-900">{calculosFinanceiros.ordens}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculosFinanceiros.ticket)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Ordens Financeiras */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="mr-2 text-blue-600" size={20} />
            Ordens Finalizadas no Período
          </h3>
        </div>
        <div className="p-6">
          <SortableTable
            data={ordensComClientes}
            columns={colunas}
            keyExtractor={(ordem) => ordem.id}
            emptyMessage="Nenhuma ordem finalizada no período"
            emptyIcon={<DollarSign size={48} className="text-gray-300" />}
          />
        </div>
      </div>
    </div>
  );
};
