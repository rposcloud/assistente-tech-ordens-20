
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, X, Printer, Download, Wrench, Package, DollarSign, Calendar, FileText, AlertCircle, User, Smartphone, CreditCard, Check, Filter } from 'lucide-react';
import { OrdemServico, Cliente, PecaUtilizada, Produto } from '../types';
import { OrderPrint } from '../components/print/OrderPrint';
import { formatCurrency, parseCurrency } from '../utils/masks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Ordens = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrdemServico | null>(null);
  const [printingOrder, setPrintingOrder] = useState<OrdemServico | null>(null);
  const [finalizingOrder, setFinalizingOrder] = useState<OrdemServico | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [pagamentoFilter, setPagamentoFilter] = useState<string>('todos');
  const [searchProduto, setSearchProduto] = useState('');
  const [showProdutosList, setShowProdutosList] = useState(false);
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
    observacoesInternas: '',
    finalizada: false
  });

  const [finalizarData, setFinalizarData] = useState({
    formaPagamento: 'dinheiro' as any,
    desconto: 0,
    acrescimo: 0,
    observacoesPagamento: ''
  });

  const [novaPeca, setNovaPeca] = useState({
    nome: '',
    quantidade: 1,
    valorUnitario: 0
  });

  useEffect(() => {
    const ordensSalvas = localStorage.getItem('ordens');
    const clientesSalvos = localStorage.getItem('clientes');
    const produtosSalvos = localStorage.getItem('produtos');
    
    if (ordensSalvas) {
      setOrdens(JSON.parse(ordensSalvas));
    }
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
    if (produtosSalvos) {
      setProdutos(JSON.parse(produtosSalvos));
    }
  }, []);

  useEffect(() => {
    // Calcular valores automaticamente
    const valorPecas = (formData.pecasUtilizadas || []).reduce((total, peca) => total + peca.valorTotal, 0);
    const valorTotal = (formData.valorMaoObra || 0) + valorPecas;
    
    if (valorTotal !== formData.valorTotal) {
      setFormData(prev => ({ 
        ...prev, 
        valorTotal
      }));
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

  const handleFinalizarOS = (ordem: OrdemServico) => {
    setFinalizingOrder(ordem);
    setFinalizarData({
      formaPagamento: 'dinheiro',
      desconto: 0,
      acrescimo: 0,
      observacoesPagamento: ''
    });
    setShowFinalizarModal(true);
  };

  const confirmFinalizarOS = () => {
    if (finalizingOrder) {
      const valorFinal = (finalizingOrder.valorTotal || 0) - finalizarData.desconto + finalizarData.acrescimo;
      const ordensAtualizadas = ordens.map(o => {
        if (o.id === finalizingOrder.id) {
          return {
            ...o,
            status: 'entregue' as const,
            finalizada: true,
            dataConclusao: new Date().toISOString().split('T')[0],
            statusPagamento: 'pago' as const,
            dataPagamento: new Date().toISOString().split('T')[0],
            formaPagamento: finalizarData.formaPagamento,
            desconto: finalizarData.desconto,
            acrescimo: finalizarData.acrescimo,
            valorFinal: valorFinal,
            observacoesPagamento: finalizarData.observacoesPagamento
          };
        }
        return o;
      });
      saveOrdens(ordensAtualizadas);
      setShowFinalizarModal(false);
      setFinalizingOrder(null);
    }
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
    if (printRef.current && printingOrder) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Ordem de Serviço #${printingOrder.numero}</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 0;
                  color: #000;
                  background: white;
                  font-size: 12px;
                  line-height: 1.4;
                }
                
                @media print {
                  body { margin: 0; padding: 0; }
                  .print-container { 
                    width: 100%; 
                    margin: 0; 
                    padding: 15mm;
                    page-break-after: always;
                  }
                }
                
                @media screen {
                  .print-container { 
                    max-width: 210mm; 
                    margin: 0 auto; 
                    padding: 20px;
                  }
                }
                
                /* Layout utilities */
                .flex { display: flex; }
                .grid { display: grid; }
                .block { display: block; }
                .inline-block { display: inline-block; }
                .w-full { width: 100%; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                
                /* Grid layouts */
                .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
                .grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
                
                /* Spacing */
                .gap-2 { gap: 0.5rem; }
                .gap-4 { gap: 1rem; }
                .gap-6 { gap: 1.5rem; }
                .gap-8 { gap: 2rem; }
                .gap-12 { gap: 3rem; }
                
                .space-y-1 > * + * { margin-top: 0.25rem; }
                .space-y-2 > * + * { margin-top: 0.5rem; }
                .space-y-3 > * + * { margin-top: 0.75rem; }
                .space-y-4 > * + * { margin-top: 1rem; }
                .space-y-6 > * + * { margin-top: 1.5rem; }
                
                /* Margins */
                .mb-1 { margin-bottom: 0.25rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-3 { margin-bottom: 0.75rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mb-8 { margin-bottom: 2rem; }
                .mb-12 { margin-bottom: 3rem; }
                .mb-16 { margin-bottom: 4rem; }
                .mt-1 { margin-top: 0.25rem; }
                .mt-2 { margin-top: 0.5rem; }
                .mt-3 { margin-top: 0.75rem; }
                .mt-4 { margin-top: 1rem; }
                .mt-6 { margin-top: 1.5rem; }
                .mt-8 { margin-top: 2rem; }
                .mt-12 { margin-top: 3rem; }
                .ml-2 { margin-left: 0.5rem; }
                .ml-3 { margin-left: 0.75rem; }
                .mr-1 { margin-right: 0.25rem; }
                .mr-2 { margin-right: 0.5rem; }
                
                /* Padding */
                .p-2 { padding: 0.5rem; }
                .p-3 { padding: 0.75rem; }
                .p-4 { padding: 1rem; }
                .p-6 { padding: 1.5rem; }
                .p-8 { padding: 2rem; }
                .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
                .px-4 { padding-left: 1rem; padding-right: 1rem; }
                .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
                .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
                .pt-2 { padding-top: 0.5rem; }
                .pt-8 { padding-top: 2rem; }
                .pb-4 { padding-bottom: 1rem; }
                
                /* Borders */
                .border { border: 1px solid #d1d5db; }
                .border-2 { border: 2px solid #d1d5db; }
                .border-b { border-bottom: 1px solid #d1d5db; }
                .border-b-2 { border-bottom: 2px solid #d1d5db; }
                .border-t { border-top: 1px solid #d1d5db; }
                .border-l-4 { border-left: 4px solid #d1d5db; }
                .border-blue-500 { border-color: #3b82f6; }
                .border-blue-600 { border-color: #2563eb; }
                .border-green-500 { border-color: #10b981; }
                .border-yellow-500 { border-color: #f59e0b; }
                .border-gray-500 { border-color: #6b7280; }
                .border-b-2.border-blue-600 { border-bottom: 2px solid #2563eb; }
                .border-l-4.border-blue-500 { border-left: 4px solid #3b82f6; }
                .border-l-4.border-blue-600 { border-left: 4px solid #2563eb; }
                .border-l-4.border-green-500 { border-left: 4px solid #10b981; }
                .border-l-4.border-yellow-500 { border-left: 4px solid #f59e0b; }
                .border-l-4.border-gray-500 { border-left: 4px solid #6b7280; }
                
                /* Background colors */
                .bg-white { background-color: #ffffff; }
                .bg-gray-50 { background-color: #f9fafb; }
                .bg-gray-100 { background-color: #f3f4f6; }
                .bg-blue-50 { background-color: #eff6ff; }
                .bg-blue-600 { background-color: #2563eb; }
                .bg-green-50 { background-color: #f0fdf4; }
                .bg-yellow-50 { background-color: #fefce8; }
                
                /* Text colors */
                .text-blue-600 { color: #2563eb; }
                .text-blue-900 { color: #1e3a8a; }
                .text-green-600 { color: #16a34a; }
                .text-green-900 { color: #14532d; }
                .text-yellow-900 { color: #713f12; }
                .text-gray-500 { color: #6b7280; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-700 { color: #374151; }
                .text-gray-900 { color: #111827; }
                .text-white { color: #ffffff; }
                
                /* Text sizes */
                .text-xs { font-size: 0.75rem; }
                .text-sm { font-size: 0.875rem; }
                .text-base { font-size: 1rem; }
                .text-lg { font-size: 1.125rem; }
                .text-xl { font-size: 1.25rem; }
                .text-2xl { font-size: 1.5rem; }
                .text-3xl { font-size: 1.875rem; }
                
                /* Font weights */
                .font-medium { font-weight: 500; }
                .font-semibold { font-weight: 600; }
                .font-bold { font-weight: 700; }
                
                /* Flexbox utilities */
                .justify-between { justify-content: space-between; }
                .justify-center { justify-content: center; }
                .items-center { align-items: center; }
                .items-start { align-items: flex-start; }
                
                /* Tables */
                .table { 
                  display: table; 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 0.5rem 0;
                }
                .table th, .table td { 
                  border: 1px solid #d1d5db; 
                  padding: 8px; 
                  text-align: left; 
                  vertical-align: top;
                }
                .table th { 
                  background-color: #f3f4f6; 
                  font-weight: bold; 
                }
                .table .text-center { text-align: center; }
                .table .text-right { text-align: right; }
                .table .font-bold { font-weight: bold; }
                
                /* Signature lines */
                .signature-line {
                  border-top: 2px solid #000;
                  margin-top: 40px;
                  padding-top: 8px;
                  text-align: center;
                  min-height: 60px;
                }
                
                /* Border radius removal for print */
                .rounded-lg, .rounded { border-radius: 0; }
                
                /* Opacity */
                .opacity-90 { opacity: 0.9; }
                
                /* Hide elements in print */
                .no-print { display: none !important; }
                
                @page {
                  size: A4;
                  margin: 15mm;
                }
                
                /* Ensure proper page breaks */
                .page-break-before { page-break-before: always; }
                .page-break-after { page-break-after: always; }
                .page-break-inside-avoid { page-break-inside: avoid; }
              </style>
            </head>
            <body>
              ${printContent}
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
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
      observacoesInternas: '',
      finalizada: false
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

  const adicionarProdutoCadastrado = (produto: Produto, quantidade: number = 1) => {
    const peca: PecaUtilizada = {
      id: Date.now().toString(),
      nome: produto.nome,
      quantidade: quantidade,
      valorUnitario: produto.precoVenda,
      valorTotal: quantidade * produto.precoVenda
    };

    setFormData({
      ...formData,
      pecasUtilizadas: [...(formData.pecasUtilizadas || []), peca]
    });
    setSearchProduto('');
    setShowProdutosList(false);
  };

  const removerPeca = (id: string) => {
    setFormData({
      ...formData,
      pecasUtilizadas: (formData.pecasUtilizadas || []).filter(peca => peca.id !== id)
    });
  };

  const produtosFiltrados = produtos.filter(produto => 
    produto.ativo && 
    (produto.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
     produto.codigo?.toLowerCase().includes(searchProduto.toLowerCase()))
  );

  const ordensComClientes = ordens.map(ordem => ({
    ...ordem,
    cliente: clientes.find(cliente => cliente.id === ordem.clienteId)
  }));

  const ordensFiltradas = ordensComClientes.filter(ordem => {
    const matchesSearch = ordem.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.defeitoRelatado.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || ordem.status === statusFilter;
    const matchesPagamento = pagamentoFilter === 'todos' || ordem.statusPagamento === pagamentoFilter;
    
    return matchesSearch && matchesStatus && matchesPagamento;
  });

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

  const pagamentoColors = {
    pendente: 'bg-red-100 text-red-800',
    pago: 'bg-green-100 text-green-800',
    parcial: 'bg-yellow-100 text-yellow-800',
    cancelado: 'bg-gray-100 text-gray-800'
  };

  const pagamentoTexts = {
    pendente: 'Pendente',
    pago: 'Pago',
    parcial: 'Parcial',
    cancelado: 'Cancelado'
  };

  const tipoEquipamentoOptions = [
    { value: 'smartphone', label: 'Smartphone', icon: Smartphone },
    { value: 'notebook', label: 'Notebook', icon: Package },
    { value: 'desktop', label: 'Desktop', icon: Package },
    { value: 'tablet', label: 'Tablet', icon: Package },
    { value: 'outros', label: 'Outros', icon: Package }
  ];

  // Cálculos para resumo financeiro
  const resumoFinanceiro = {
    totalOrdens: ordensFiltradas.length,
    valorTotal: ordensFiltradas.reduce((acc, ordem) => acc + (ordem.valorFinal || ordem.valorTotal || 0), 0),
    ordensPagas: ordensFiltradas.filter(ordem => ordem.statusPagamento === 'pago').length,
    ordensPendentes: ordensFiltradas.filter(ordem => ordem.statusPagamento === 'pendente').length,
    lucroTotal: ordensFiltradas.reduce((acc, ordem) => acc + (ordem.lucro || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wrench className="mr-3 text-blue-600" size={32} />
            Ordens de Serviço
          </h1>
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

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Ordens</p>
              <p className="text-2xl font-bold text-gray-900">{resumoFinanceiro.totalOrdens}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(resumoFinanceiro.valorTotal)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pagas</p>
              <p className="text-2xl font-bold text-green-600">{resumoFinanceiro.ordensPagas}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-2xl font-bold text-red-600">{resumoFinanceiro.ordensPendentes}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Lucro Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(resumoFinanceiro.lucroTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar ordens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os Status</option>
                {Object.entries(statusTexts).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={pagamentoFilter}
                onChange={(e) => setPagamentoFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os Pagamentos</option>
                {Object.entries(pagamentoTexts).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordensFiltradas.map((ordem) => (
                <tr key={ordem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <Wrench className="mr-2 text-blue-500" size={16} />
                      #{ordem.numero}
                      {ordem.finalizada && (
                        <Check className="ml-2 text-green-500" size={16} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <User className="mr-2 text-gray-400" size={16} />
                      {ordem.cliente?.nome || 'Cliente não encontrado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ordem.marca} {ordem.modelo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ordem.status]}`}>
                      {statusTexts[ordem.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${pagamentoColors[ordem.statusPagamento || 'pendente']}`}>
                      {pagamentoTexts[ordem.statusPagamento || 'pendente']}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <DollarSign className="mr-1 text-green-500" size={16} />
                      {formatCurrency(ordem.valorFinal || ordem.valorTotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {!ordem.finalizada && ordem.status === 'pronto_entrega' && (
                        <button
                          onClick={() => handleFinalizarOS(ordem)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center transition-colors"
                          title="Finalizar OS"
                        >
                          <Check size={14} className="mr-1" />
                          Finalizar
                        </button>
                      )}
                      <button
                        onClick={() => handlePrint(ordem)}
                        className="text-green-600 hover:text-green-900"
                        title="Imprimir OS"
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(ordem)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar OS"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ordem.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir OS"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ordensFiltradas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Wrench size={48} className="mx-auto mb-4 text-gray-300" />
              Nenhuma ordem de serviço encontrada
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário Simplificado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <Wrench className="mr-2 text-blue-600" size={24} />
                  {editingOrder ? 'Editar Ordem' : 'Nova Ordem de Serviço'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="equipamento" className="p-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="equipamento" className="flex items-center">
                    <Smartphone className="mr-2" size={16} />
                    Equipamento
                  </TabsTrigger>
                  <TabsTrigger value="diagnostico" className="flex items-center">
                    <AlertCircle className="mr-2" size={16} />
                    Diagnóstico
                  </TabsTrigger>
                  <TabsTrigger value="pecas" className="flex items-center">
                    <Package className="mr-2" size={16} />
                    Peças e Valor
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="equipamento" className="space-y-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-4 flex items-center">
                      <User className="mr-2" size={18} />
                      Dados Básicos
                    </h4>
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
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
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

                    <div className="grid grid-cols-2 gap-4 mt-4">
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Entrega</label>
                        <input
                          type="date"
                          value={formData.prazoEntrega || ''}
                          onChange={(e) => setFormData({ ...formData, prazoEntrega: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="diagnostico" className="space-y-4 mt-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-4 flex items-center">
                      <AlertCircle className="mr-2" size={18} />
                      Descrições Técnicas
                    </h4>
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <FileText className="mr-1" size={16} />
                          Observações Internas
                        </label>
                        <textarea
                          value={formData.observacoesInternas || ''}
                          onChange={(e) => setFormData({ ...formData, observacoesInternas: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Observações para uso interno..."
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pecas" className="space-y-4 mt-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-4 flex items-center">
                      <Package className="mr-2" size={18} />
                      Peças e Componentes
                    </h4>
                    
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

                    {/* Busca de produtos */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Produtos/Serviços:</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Digite o nome ou código do produto..."
                          value={searchProduto}
                          onChange={(e) => {
                            setSearchProduto(e.target.value);
                            setShowProdutosList(e.target.value.length > 0);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {showProdutosList && produtosFiltrados.length > 0 && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                            {produtosFiltrados.map(produto => (
                              <div
                                key={produto.id}
                                onClick={() => adicionarProdutoCadastrado(produto)}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{produto.nome}</div>
                                <div className="text-sm text-gray-500">
                                  {produto.codigo && `Código: ${produto.codigo} | `}
                                  Preço: {formatCurrency(produto.precoVenda)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Adicionar nova peça manual */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <h5 className="text-sm font-medium mb-3">Adicionar Peça Manual</h5>
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

                    <div className="mt-4 bg-white p-3 rounded border">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Mão de Obra:</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.valorMaoObra || 0}
                          onChange={(e) => setFormData({ ...formData, valorMaoObra: Number(e.target.value) })}
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>TOTAL:</span>
                        <span className="text-blue-600">{formatCurrency(formData.valorTotal || 0)}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex space-x-3 px-6 py-4 border-t bg-gray-50">
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

      {/* Modal Finalizar OS */}
      {showFinalizarModal && finalizingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center">
                <Check className="mr-2 text-green-600" size={20} />
                Finalizar Ordem de Serviço
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-sm">
                  <div className="font-bold text-blue-900 mb-1">OS #{finalizingOrder.numero}</div>
                  <div className="text-blue-800 text-xs">
                    <strong>Cliente:</strong> {clientes.find(c => c.id === finalizingOrder.clienteId)?.nome}<br/>
                    <strong>Equipamento:</strong> {finalizingOrder.marca} {finalizingOrder.modelo}<br/>
                    <strong>Status:</strong> <span className="font-semibold">{statusTexts[finalizingOrder.status]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento *</label>
                  <select
                    value={finalizarData.formaPagamento}
                    onChange={(e) => setFinalizarData({ ...finalizarData, formaPagamento: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  >
                    <option value="dinheiro">💵 Dinheiro</option>
                    <option value="cartao_credito">💳 Cartão de Crédito</option>
                    <option value="cartao_debito">💳 Cartão de Débito</option>
                    <option value="pix">📱 PIX</option>
                    <option value="transferencia">🏦 Transferência</option>
                    <option value="parcelado">📊 Parcelado</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={finalizingOrder.valorTotal}
                      value={finalizarData.desconto}
                      onChange={(e) => setFinalizarData({ ...finalizarData, desconto: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Acréscimo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={finalizarData.acrescimo}
                      onChange={(e) => setFinalizarData({ ...finalizarData, acrescimo: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    value={finalizarData.observacoesPagamento}
                    onChange={(e) => setFinalizarData({ ...finalizarData, observacoesPagamento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows={2}
                    placeholder="Observações sobre o pagamento..."
                  />
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 text-sm">Resumo Financeiro</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Valor Original:</span>
                      <span className="font-semibold">{formatCurrency(finalizingOrder.valorTotal)}</span>
                    </div>
                    {finalizarData.desconto > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Desconto:</span>
                        <span>-{formatCurrency(finalizarData.desconto)}</span>
                      </div>
                    )}
                    {finalizarData.acrescimo > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Acréscimo:</span>
                        <span>+{formatCurrency(finalizarData.acrescimo)}</span>
                      </div>
                    )}
                    <hr className="my-1 border-green-300" />
                    <div className="flex justify-between text-sm font-bold text-green-800">
                      <span>VALOR FINAL:</span>
                      <span>{formatCurrency((finalizingOrder.valorTotal || 0) - finalizarData.desconto + finalizarData.acrescimo)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <AlertCircle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" size={14} />
                    <div className="text-xs text-yellow-800">
                      <strong>Atenção:</strong> Ao finalizar a OS, o status será alterado para "Entregue" 
                      e o pagamento será marcado como "Pago".
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowFinalizarModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmFinalizarOS}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center text-sm"
              >
                <Check size={14} className="mr-1" />
                Finalizar OS
              </button>
            </div>
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
