import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmpresaData {
  id?: string;
  nome_completo: string;
  empresa?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email_empresa?: string;
  site?: string;
  logo_url?: string;
  dados_bancarios?: string;
  observacoes_empresa?: string;
}

export const Empresa = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresa, setEmpresa] = useState<EmpresaData>({
    nome_completo: '',
    empresa: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    estado: '',
    telefone: '',
    email_empresa: '',
    site: '',
    logo_url: '',
    dados_bancarios: '',
    observacoes_empresa: '',
  });

  useEffect(() => {
    if (user) {
      fetchEmpresa();
    }
  }, [user]);

  const fetchEmpresa = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setEmpresa(data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmpresaData, value: string) => {
    setEmpresa(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const buscarCEP = async (cep: string) => {
    const cepNumbers = cep.replace(/\D/g, '');
    if (cepNumbers.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setEmpresa(prev => ({
            ...prev,
            endereco: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (máx. 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'Arquivo muito grande. Máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Apenas arquivos de imagem são aceitos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Converter para base64 para armazenar
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        handleInputChange('logo_url', base64String);
        toast({
          title: 'Sucesso',
          description: 'Logo carregada com sucesso!',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload da logo.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(empresa),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Dados da empresa salvos com sucesso!',
        });
      } else {
        throw new Error('Erro ao salvar dados');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar dados da empresa',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          Dados da Empresa
        </h1>
        <p className="text-gray-600 mt-2">
          Configure os dados da sua assistência técnica. Essas informações aparecerão nas ordens de serviço.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_completo">Nome do Responsável *</Label>
                <Input
                  id="nome_completo"
                  value={empresa.nome_completo}
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                  placeholder="Nome completo do responsável"
                  required
                />
              </div>
              <div>
                <Label htmlFor="empresa">Nome da Empresa *</Label>
                <Input
                  id="empresa"
                  value={empresa.empresa || ''}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  placeholder="Nome fantasia da empresa"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={empresa.cnpj || ''}
                  onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              <div>
                <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                <Input
                  id="inscricao_estadual"
                  value={empresa.inscricao_estadual || ''}
                  onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
                  placeholder="Inscrição Estadual"
                />
              </div>
              <div>
                <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                <Input
                  id="inscricao_municipal"
                  value={empresa.inscricao_municipal || ''}
                  onChange={(e) => handleInputChange('inscricao_municipal', e.target.value)}
                  placeholder="Inscrição Municipal"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={empresa.cep || ''}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    handleInputChange('cep', formatted);
                    if (formatted.replace(/\D/g, '').length === 8) {
                      buscarCEP(formatted);
                    }
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={empresa.endereco || ''}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, Avenida..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={empresa.numero || ''}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="123"
                />
              </div>
              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={empresa.complemento || ''}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Apto, Sala..."
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={empresa.bairro || ''}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={empresa.estado || ''}
                  onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={empresa.cidade || ''}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                placeholder="Cidade"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={empresa.telefone || ''}
                  onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>
              <div>
                <Label htmlFor="email_empresa">E-mail da Empresa</Label>
                <Input
                  id="email_empresa"
                  type="email"
                  value={empresa.email_empresa || ''}
                  onChange={(e) => handleInputChange('email_empresa', e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="site">Site</Label>
              <Input
                id="site"
                value={empresa.site || ''}
                onChange={(e) => handleInputChange('site', e.target.value)}
                placeholder="https://www.empresa.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Informações Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo_upload">Upload da Logo</Label>
                <Input
                  id="logo_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: JPG, PNG, GIF (máx. 2MB)
                </p>
              </div>
              
              <div>
                <Label htmlFor="logo_url">URL da Logo (alternativo)</Label>
                <Input
                  id="logo_url"
                  value={empresa.logo_url || ''}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              {empresa.logo_url && (
                <div className="mt-2">
                  <Label>Preview da Logo</Label>
                  <div className="mt-1 border rounded-lg p-4 bg-gray-50">
                    <img
                      src={empresa.logo_url}
                      alt="Logo da empresa"
                      className="max-h-16 max-w-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="dados_bancarios">Dados Bancários</Label>
              <Textarea
                id="dados_bancarios"
                value={empresa.dados_bancarios || ''}
                onChange={(e) => handleInputChange('dados_bancarios', e.target.value)}
                placeholder="Banco, Agência, Conta, PIX..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="observacoes_empresa">Observações</Label>
              <Textarea
                id="observacoes_empresa"
                value={empresa.observacoes_empresa || ''}
                onChange={(e) => handleInputChange('observacoes_empresa', e.target.value)}
                placeholder="Informações adicionais sobre a empresa..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || !empresa.nome_completo || !empresa.empresa}
            className="px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </div>
    </div>
  );
};