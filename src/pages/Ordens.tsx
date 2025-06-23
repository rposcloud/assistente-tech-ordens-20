import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, X, Printer, Download } from 'lucide-react';
import { OrdemServico, Cliente, PecaUtilizada } from '../types';
import { OrderPrint } from '../components/print/OrderPrint';
import { formatCurrency, parseCurrency } from '../utils/masks';

export const Ordens = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrdemServico | null>(null);
  const [printingOrder, setPrintingOrder] = useState<OrdemServico | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Partial<OrdemServico>>({
    clienteId: '',
    tipoEquipamento: 'smartphone',
    marca: '',
    modelo: '',
    numeroSerie: '',
    defeitoRelatado: '',
    diagnosticoTecnico: '',
    solucaoAplicada: '',
    pecasUtilizadas: [],
    valorMaoObra: 0,
    valorTotal: 0,
    prazoEntrega: '',
    garantia: 90,
    status: 'aguardando_diagnostico',
    observacoesInternas: ''
  });

  const [novaPeca, setNovaPeca] = useState({
    nome: '',
    quantidade: 1,
    valorUnitario: 0
  });

  useEffect(() => {
    const ordensSalvas = localStorage.getItem('ordens');
    const clientesSalvos = localStorage.getItem('clientes');
    
    if (ordensSalvas) {
      setOrdens(JSON.parse(ordensSalvas));
    }
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
  }, []);

  useEffect(() => {
    // Calcular valor total automaticamente
    const valorPecas = (formData.pecasUtilizadas || []).reduce((total, peca) => total + peca.valorTotal, 0);
    const valorTotal = (formData.valorMaoObra || 0) + valorPecas;
    
    if (valorTotal !== formData.valorTotal) {
      setFormData(prev => ({ ...prev, valorTotal }));
    }
  }, [formData.pecasUtilizadas, formData.valorMaoObra]);

  const saveOrdens = (novasOrdens: OrdemServico[]) => {
    localStorage.setItem('ordens', JSON.stringify(novasOrdens));
    setOrdens(novasOrdens);
  };

  const generateOrderNumber = () => {
    const lastOrder = ordens.sort((a, b) => parseInt(b.numero) - parseInt(a.numero))[0];
    const nextNumber = lastOrder ? parseInt(lastOrder.numero) + 1 : 1;
    return nextNumber.toString().padStart(6, '0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOrder) {
      const ordensAtualizadas = ordens.map(ordem => {
        if (ordem.id === editingOrder.id) {
          const updatedOrder = { ...ordem, ...formData };
          if (formData.status === 'entregue' && !ordem.dataConclusao) {
            updatedOrder.dataConclusao = new Date().toISOString().split('T')[0];
          }
          return updatedOrder;
        }
        return ordem;
      });
      saveOrdens(ordensAtualizadas);
    } else {
      const novaOrdem: OrdemServico = {
        id: Date.now().toString(),
        numero: generateOrderNumber(),
        ...formData,
        dataAbertura: new Date().toISOString().split('T')[0],
        dataConclusao: formData.status === 'entregue' ? new Date().toISOString().split('T')[0] : undefined
      } as OrdemServico;
      saveOrdens([...ordens, novaOrdem]);
    }

    closeModal();
  };

  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrder(ordem);
    setFormData({ ...ordem });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      const ordensFiltradas = ordens.filter(ordem => ordem.id !== id);
      saveOrdens(ordensFiltradas);
    }
  };

  const handlePrint = (ordem: OrdemServico) => {
    setPrintingOrder(ordem);
    setShowPrintModal(true);
  };

  const handlePrintDocument = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ordem de Serviço #${printingOrder?.numero}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                @media print { body { margin: 0; padding: 0; } }
                .print\\:p-4 { padding: 1rem !important; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData({
      clienteId: '',
      tipoEquipamento: 'smartphone',
      marca: '',
      modelo: '',
      numeroSerie: '',
      defeitoRelatado: '',
      diagnosticoTecnico: '',
      solucaoAplicada: '',
      pecasUtilizadas: [],
      valorMaoObra: 0,
      valorTotal: 0,
      prazoEntrega: '',
      garantia: 90,
      status: 'aguardando_diagnostico',
      observacoesInternas: ''
    });
    setNovaPeca({ nome: '', quantidade: 1, valorUnitario: 0 });
  };

  const adicionarPeca = () => {
    if (novaPeca.nome && novaPeca.valorUnitario > 0) {
      const peca: PecaUtilizada = {
        id: Date.now().toString(),
        nome: novaPeca.nome,
        quantidade: novaPeca.quantidade,
        valorUnitario: novaPeca.valorUnitario,
        valorTotal: novaPeca.quantidade * novaPeca.valorUnitario
      };

      setFormData({
        ...formData,
        pecasUtilizadas: [...(formData.pecasUtilizadas || []), peca]
      });

      setNovaPeca({ nome: '', quantidade: 1, valorUnitario: 0 });
    }
  };

  const removerPeca = (id: string) => {
    setFormData({
      ...formData,
      pecasUtilizadas: (formData.pecasUtilizadas || []).filter(peca => peca.id !== id)
    });
  };

  const ordensComClientes = ordens.map(ordem => ({
    ...ordem,
    cliente: clientes.find(cliente => cliente.id === ordem.clienteId)
  }));

  const ordensFiltradas = ordensComClientes.filter(ordem =>
    ordem.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.defeitoRelatado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    aguardando_diagnostico: 'bg-gray-100 text-gray-800',
    aguardando_aprovacao: 'bg-yellow-100 text-yellow-800',
    aguardando_pecas: 'bg-orange-100 text-orange-800',
    em_reparo: 'bg-blue-100 text-blue-800',
    pronto_entrega: 'bg-green-100 text-green-800',
    entregue: 'bg-green-200 text-green-900'
  };

  const statusTexts = {
    aguardando_diagnostico: 'Aguardando Diagnóstico',
    aguardando_aprovacao: 'Aguardando Aprovação',
    aguardando_pecas: 'Aguardando Peças',
    em_reparo: 'Em Reparo',
    pronto_entrega: 'Pronto para Entrega',
    entregue: 'Entregue'
  };

  const tipoEquipamentoOptions = [
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'notebook', label: 'Notebook' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'outros', label: 'Outros' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie as ordens de serviço</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nova Ordem
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar ordens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defeito</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordensFiltradas.map((ordem) => (
                <tr key={ordem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{ordem.numero}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ordem.cliente?.nome || 'Cliente não encontrado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ordem.marca} {ordem.modelo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{ordem.defeitoRelatado}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ordem.status]}`}>
                      {statusTexts[ordem.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(ordem.valorTotal)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handlePrint(ordem)}
                      className="text-green-600 hover:text-green-900 mr-2"
                      title="Imprimir"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(ordem)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(ordem.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ordensFiltradas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma ordem de serviço encontrada
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingOrder ? 'Editar Ordem' : 'Nova Ordem de Serviço'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dados Básicos */}
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-800">Dados Básicos</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                    <select
                      required
                      value={formData.clienteId || ''}
                      onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Equipamento *</label>
                    <select
                      value={formData.tipoEquipamento || 'smartphone'}
                      onChange={(e) => setFormData({ ...formData, tipoEquipamento: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {tipoEquipamentoOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status || 'aguardando_diagnostico'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(statusTexts).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Equipamento */}
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-800">Informações do Equipamento</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                    <input
                      type="text"
                      required
                      value={formData.marca || ''}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Samsung, Apple, Dell..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                    <input
                      type="text"
                      required
                      value={formData.modelo || ''}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Galaxy S21, iPhone 13, Inspiron..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Série</label>
                    <input
                      type="text"
                      value={formData.numeroSerie || ''}
                      onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Número de série do equipamento"
                    />
                  </div>
                </div>
              </div>

              {/* Descrições */}
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-800">Descrições</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Defeito Relatado pelo Cliente *</label>
                    <textarea
                      required
                      value={formData.defeitoRelatado || ''}
                      onChange={(e) => setFormData({ ...formData, defeitoRelatado: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Descreva o problema relatado pelo cliente..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico Técnico</label>
                    <textarea
                      value={formData.diagnosticoTecnico || ''}
                      onChange={(e) => setFormData({ ...formData, diagnosticoTecnico: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Diagnóstico detalhado do problema..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Solução Aplicada</label>
                    <textarea
                      value={formData.solucaoAplicada || ''}
                      onChange={(e) => setFormData({ ...formData, solucaoAplicada: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Descreva a solução aplicada..."
                    />
                  </div>
                </div>
              </div>

              {/* Peças Utilizadas */}
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-800">Peças Utilizadas</h4>
                
                {/* Lista de peças */}
                {(formData.pecasUtilizadas || []).length > 0 && (
                  <div className="mb-4">
                    <table className="w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-2 py-1 text-left">Peça</th>
                          <th className="border border-gray-300 px-2 py-1 text-center">Qtd</th>
                          <th className="border border-gray-300 px-2 py-1 text-right">Valor Unit.</th>
                          <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                          <th className="border border-gray-300 px-2 py-1 text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(formData.pecasUtilizadas || []).map((peca) => (
                          <tr key={peca.id}>
                            <td className="border border-gray-300 px-2 py-1">{peca.nome}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{peca.quantidade}</td>
                            <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(peca.valorUnitario)}</td>
                            <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(peca.valorTotal)}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              <button
                                type="button"
                                onClick={() => removerPeca(peca.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Adicionar nova peça */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h5 className="text-sm font-medium mb-3">Adicionar Peça</h5>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Nome da peça"
                        value={novaPeca.nome}
                        onChange={(e) => setNovaPeca({ ...novaPeca, nome: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Qtd"
                        min="1"
                        value={novaPeca.quantidade}
                        onChange={(e) => setNovaPeca({ ...novaPeca, quantidade: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Valor unitário"
                        step="0.01"
                        min="0"
                        value={novaPeca.valorUnitario}
                        onChange={(e) => setNovaPeca({ ...novaPeca, valorUnitario: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={adicionarPeca}
                        className="w-full px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Valores e Prazos */}
              <div>
                <h4 className="text-md font-medium mb-4 text-gray-800">Valores e Prazos</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mão de Obra</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorMaoObra || 0}
                      onChange={(e) => setFormData({ ...formData, valorMaoObra: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                    <input
                      type="text"
                      value={formatCurrency(formData.valorTotal || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Entrega</label>
                    <input
                      type="date"
                      value={formData.prazoEntrega || ''}
                      onChange={(e) => setFormData({ ...formData, prazoEntrega: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Garantia (dias)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.garantia || 90}
                      onChange={(e) => setFormData({ ...formData, garantia: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações Internas</label>
                <textarea
                  value={formData.observacoesInternas || ''}
                  onChange={(e) => setFormData({ ...formData, observacoesInternas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Observações para uso interno..."
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingOrder ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Impressão */}
      {showPrintModal && printingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Visualizar Impressão - Ordem #{printingOrder.numero}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrintDocument}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  >
                    <Printer size={16} className="mr-2" />
                    Imprimir
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <OrderPrint
                ref={printRef}
                ordem={printingOrder}
                cliente={clientes.find(c => c.id === printingOrder.clienteId)!}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
