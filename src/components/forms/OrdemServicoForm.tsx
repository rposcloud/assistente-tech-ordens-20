
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useClientes } from '@/hooks/useClientes';
import { OrdemServico } from '@/hooks/useOrdens';

interface OrdemServicoFormProps {
  onSubmit: (data: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: OrdemServico;
  loading?: boolean;
}

export const OrdemServicoForm: React.FC<OrdemServicoFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false
}) => {
  const { clientes } = useClientes();
  const [formData, setFormData] = useState<Partial<OrdemServico>>({
    cliente_id: '',
    tipo_equipamento: 'smartphone',
    marca: '',
    modelo: '',
    numero_serie: '',
    senha_equipamento: '',
    acessorios: '',
    condicoes_equipamento: '',
    defeito_relatado: '',
    diagnostico_tecnico: '',
    solucao_aplicada: '',
    tecnico_responsavel: '',
    prioridade: 'normal',
    valor_mao_obra: 0,
    valor_orcamento: 0,
    valor_total: 0,
    desconto: 0,
    acrescimo: 0,
    valor_final: 0,
    forma_pagamento: 'dinheiro',
    status_pagamento: 'pendente',
    data_vencimento: '',
    data_previsao_entrega: '',
    prazo_entrega: '',
    garantia: 90,
    status: 'aguardando_diagnostico',
    aprovado_cliente: false,
    observacoes_internas: '',
    observacoes_pagamento: '',
    finalizada: false,
    ...initialData
  });

  // Calcular valor final automaticamente
  useEffect(() => {
    const valorBase = (formData.valor_total || 0);
    const desconto = (formData.desconto || 0);
    const acrescimo = (formData.acrescimo || 0);
    const valorFinal = valorBase - desconto + acrescimo;
    
    setFormData(prev => ({ ...prev, valor_final: valorFinal }));
  }, [formData.valor_total, formData.desconto, formData.acrescimo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<OrdemServico, 'id' | 'created_at' | 'updated_at'>);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente e Equipamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => updateField('cliente_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.telefone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_equipamento">Tipo de Equipamento *</Label>
              <Select value={formData.tipo_equipamento} onValueChange={(value) => updateField('tipo_equipamento', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="notebook">Notebook</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => updateField('marca', e.target.value)}
                placeholder="Ex: Apple, Samsung, Dell"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => updateField('modelo', e.target.value)}
                placeholder="Ex: iPhone 13, Galaxy S21"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e) => updateField('numero_serie', e.target.value)}
                placeholder="Número de série do equipamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha_equipamento">Senha/PIN do Equipamento</Label>
              <Input
                id="senha_equipamento"
                value={formData.senha_equipamento}
                onChange={(e) => updateField('senha_equipamento', e.target.value)}
                placeholder="Senha de desbloqueio"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="acessorios">Acessórios Entregues</Label>
            <Textarea
              id="acessorios"
              value={formData.acessorios}
              onChange={(e) => updateField('acessorios', e.target.value)}
              placeholder="Ex: Carregador, fone de ouvido, capa..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condicoes_equipamento">Condições do Equipamento</Label>
            <Textarea
              id="condicoes_equipamento"
              value={formData.condicoes_equipamento}
              onChange={(e) => updateField('condicoes_equipamento', e.target.value)}
              placeholder="Estado físico, arranhões, marcas de uso..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problema e Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defeito_relatado">Defeito Relatado pelo Cliente *</Label>
            <Textarea
              id="defeito_relatado"
              value={formData.defeito_relatado}
              onChange={(e) => updateField('defeito_relatado', e.target.value)}
              placeholder="Descreva o problema relatado pelo cliente"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnostico_tecnico">Diagnóstico Técnico</Label>
            <Textarea
              id="diagnostico_tecnico"
              value={formData.diagnostico_tecnico}
              onChange={(e) => updateField('diagnostico_tecnico', e.target.value)}
              placeholder="Diagnóstico técnico detalhado"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solucao_aplicada">Solução Aplicada</Label>
            <Textarea
              id="solucao_aplicada"
              value={formData.solucao_aplicada}
              onChange={(e) => updateField('solucao_aplicada', e.target.value)}
              placeholder="Descreva o reparo realizado"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tecnico_responsavel">Técnico Responsável</Label>
              <Input
                id="tecnico_responsavel"
                value={formData.tecnico_responsavel}
                onChange={(e) => updateField('tecnico_responsavel', e.target.value)}
                placeholder="Nome do técnico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(value) => updateField('prioridade', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valores e Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_mao_obra">Valor Mão de Obra (R$)</Label>
              <Input
                id="valor_mao_obra"
                type="number"
                step="0.01"
                value={formData.valor_mao_obra}
                onChange={(e) => updateField('valor_mao_obra', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_orcamento">Valor Orçamento (R$)</Label>
              <Input
                id="valor_orcamento"
                type="number"
                step="0.01"
                value={formData.valor_orcamento}
                onChange={(e) => updateField('valor_orcamento', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_total">Valor Total (R$)</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                value={formData.valor_total}
                onChange={(e) => updateField('valor_total', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desconto">Desconto (R$)</Label>
              <Input
                id="desconto"
                type="number"
                step="0.01"
                value={formData.desconto}
                onChange={(e) => updateField('desconto', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acrescimo">Acréscimo (R$)</Label>
              <Input
                id="acrescimo"
                type="number"
                step="0.01"
                value={formData.acrescimo}
                onChange={(e) => updateField('acrescimo', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_final">Valor Final (R$)</Label>
              <Input
                id="valor_final"
                type="number"
                step="0.01"
                value={formData.valor_final}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select value={formData.forma_pagamento} onValueChange={(value) => updateField('forma_pagamento', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_pagamento">Status do Pagamento</Label>
              <Select value={formData.status_pagamento} onValueChange={(value) => updateField('status_pagamento', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prazos e Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => updateField('data_vencimento', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Previsão de Entrega</Label>
              <Input
                type="date"
                value={formData.data_previsao_entrega}
                onChange={(e) => updateField('data_previsao_entrega', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="garantia">Garantia (dias)</Label>
              <Input
                id="garantia"
                type="number"
                value={formData.garantia}
                onChange={(e) => updateField('garantia', parseInt(e.target.value) || 90)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status da Ordem</Label>
            <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aguardando_diagnostico">Aguardando Diagnóstico</SelectItem>
                <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                <SelectItem value="aguardando_pecas">Aguardando Peças</SelectItem>
                <SelectItem value="em_reparo">Em Reparo</SelectItem>
                <SelectItem value="pronto_entrega">Pronto para Entrega</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes_internas">Observações Internas</Label>
            <Textarea
              id="observacoes_internas"
              value={formData.observacoes_internas}
              onChange={(e) => updateField('observacoes_internas', e.target.value)}
              placeholder="Observações para uso interno"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Ordem'}
        </Button>
      </div>
    </form>
  );
};
