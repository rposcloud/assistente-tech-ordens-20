import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, FileText, Package, DollarSign, CheckCircle, BarChart3, Shield, Clock, 
  Monitor, Smartphone, Star, ArrowRight, Zap, Cloud, Palette, MessageSquare,
  Play, Download, Globe, Award, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OSCloudLogo } from '../components/OSCloudLogo';

export const HomePage = () => {
  const mainFeatures = [
    {
      icon: FileText,
      title: 'Ordens de Serviço Inteligentes',
      description: 'Sistema completo de OS com acompanhamento em tempo real, notificações automáticas e portal do cliente integrado.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      title: 'Gestão Financeira Avançada',
      description: 'Controle total de receitas, despesas, fluxo de caixa e relatórios detalhados com categorização automática.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'CRM Integrado',
      description: 'Base completa de clientes com histórico, comunicação, alertas e integração com CEP automático.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Package,
      title: 'Estoque & Produtos',
      description: 'Catálogo completo com controle de estoque, preços, categorias e integração direta com as OS.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime Garantido', icon: Shield },
    { number: '< 2s', label: 'Tempo de Resposta', icon: Zap },
    { number: '256-bit', label: 'Criptografia SSL', icon: Shield },
    { number: '24/7', label: 'Suporte Técnico', icon: MessageSquare }
  ];

  const testimonials = [
    {
      name: 'Carlos Silva',
      company: 'TechFix Assistência',
      content: 'Desde que implementamos o OS Cloud, nossa produtividade aumentou 45%. O sistema é intuitivo e realmente entende as necessidades de uma assistência técnica.',
      rating: 5
    },
    {
      name: 'Marina Costa',
      company: 'Eletrônicos Premium',
      content: 'A integração financeira é perfeita. Agora consigo acompanhar cada centavo que entra e sai, com relatórios que realmente fazem sentido para o negócio.',
      rating: 5
    },
    {
      name: 'Roberto Oliveira',
      company: 'SmartRepair',
      content: 'O portal do cliente foi um diferencial. Nossos clientes adoram poder acompanhar o status do seu equipamento em tempo real. Profissionalismo total.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <OSCloudLogo size="md" />
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Recursos</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Depoimentos</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Tecnologia que acelera seus resultados
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                O futuro da
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> assistência técnica</span>
                {' '}está aqui
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Transforme sua assistência técnica com o sistema mais completo do mercado. 
                Gerencie ordens, clientes, estoque e financeiro em uma plataforma moderna e intuitiva.
              </p>
              
              <div className="flex justify-center">
                <Link to="/cadastro">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4 text-lg">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Grátis para sempre</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Configuração em 5 min</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl transform rotate-3 opacity-10"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full w-1/2"></div>
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <OSCloudLogo size="xl" showText={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg"></div>
                    <div className="h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Recursos que fazem a diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa com tudo que você precisa para gerenciar sua assistência técnica de forma profissional
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Clientes que confiam no OS Cloud
            </h2>
            <p className="text-xl text-gray-600">
              Veja como estamos transformando assistências técnicas em todo o Brasil
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para revolucionar sua assistência técnica?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já confiam no OS Cloud
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg">
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
              <MessageSquare className="mr-2 w-5 h-5" />
              Falar com Especialista
            </Button>
          </div>
          
          <div className="mt-8 text-blue-100">
            <p>Sem compromisso • Suporte incluído • Resultados garantidos</p>
          </div>
        </div>
      </section>


    </div>
  );
};