# OS Cloud - Sistema de Gestão para Assistência Técnica

## Overview

OS Cloud é um sistema completo de gestão para assistência técnica, construído com arquitetura moderna full-stack. O sistema permite que empresas gerenciem clientes, ordens de serviço, produtos/serviços e operações financeiras através de uma interface intuitiva na nuvem. Inclui portal do cliente para acompanhamento de ordens e suporte a vários tipos de equipamentos (smartphones, notebooks, desktops, tablets).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: React Router DOM for client-side navigation
- **Authentication**: Context-based auth system with Supabase integration

### Backend Architecture
- **Server**: Express.js with TypeScript running in ESM mode
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API structure with `/api` prefix
- **Session Management**: PostgreSQL-based session storage

### Build & Development Setup
- **Development**: Vite dev server with HMR and TSX execution
- **Production Build**: Vite bundling + esbuild for server compilation
- **Package Manager**: npm with lockfile version 3
- **TypeScript**: Strict mode with modern ESNext compilation

## Key Components

### Client Management System
- Complete customer registration with CPF/CNPJ validation
- Address integration with Brazilian CEP API (ViaCEP)
- Customer history and detailed information tracking
- Document type handling (individual vs corporate)

### Service Order Management
- Comprehensive order lifecycle from diagnosis to delivery
- Equipment categorization and technical specifications
- Status tracking with multiple workflow states
- Cost calculation including labor, parts, and services
- Customer portal with secure token-based access

### Product & Service Catalog
- Dual-category system (parts and services)
- Inventory management with stock control
- Pricing structure (cost vs selling price)
- Equipment type associations
- Service time estimation

### Financial Control
- Revenue and expense tracking
- Multiple payment method support
- Financial categories and cost centers
- Monthly reporting and cash flow analysis
- Invoice and payment status management

### Customer Portal
- Token-based secure access to service orders
- Real-time order status updates
- Printable service reports
- Company branding integration

## Data Flow

### Authentication Flow
1. User login/registration through Supabase Auth
2. Profile creation and company setup
3. Session management with PostgreSQL storage
4. Protected route access based on authentication state

### Service Order Flow
1. Customer selection or creation
2. Equipment and problem registration
3. Technical diagnosis and solution documentation
4. Parts/services addition with cost calculation
5. Status updates throughout repair process
6. Customer notification via portal link
7. Final delivery and payment processing

### Data Synchronization
- Real-time updates using React Query's cache invalidation
- Optimistic updates for better user experience
- Error handling with rollback mechanisms
- Offline-first considerations for critical operations

## External Dependencies

### Database & Authentication
- **Neon Database**: Serverless PostgreSQL hosting
- **Supabase**: Authentication and user management
- **Drizzle ORM**: Type-safe database operations with migrations

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety and developer experience
- **Replit Plugins**: Development environment integration

### External APIs
- **ViaCEP**: Brazilian postal code lookup service
- **Browser APIs**: Clipboard, Print, Local Storage

## Deployment Strategy

### Development Environment
- Vite dev server with Express API proxy
- Hot module replacement for frontend
- TSX execution for backend development
- Replit-specific plugins for cloud development

### Production Build
- Frontend: Vite production build to `dist/public`
- Backend: esbuild compilation to `dist/index.js`
- Static file serving through Express
- Environment variable configuration

### Database Management
- Drizzle migrations for schema updates
- Connection pooling with Neon serverless
- Environment-based configuration

### Deployment Considerations
- Single-origin deployment with API and frontend served together
- Environment variable management for database and auth
- Static asset optimization and caching strategies

## Changelog

Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Correção crítica dos erros de validação de tipos e criação de ordens de serviço:
  * Resolvido conflitos entre tipos do frontend e backend
  * Corrigido conversões string/number para campos decimais  
  * Ajustado schema de validação Zod para aceitar ambos tipos
  * Corrigido erro toFixed() na exibição de valores na tabela
  * Sistema de ordens de serviço agora funciona completamente
- June 30, 2025. Implementação completa de integração financeira e dashboard dinâmico:
  * Adicionado funcionalidade de exclusão no sistema financeiro
  * Implementada integração automática: ordens "entregue" → entradas de receita
  * Dashboard sincronizado com dados reais (clientes, produtos, ordens, receitas)
  * Schema flexibilizado para aceitar campos null/undefined
  * Sistema totalmente operacional com todas funcionalidades integradas
- June 30, 2025. Sistema de produtos/serviços nas ordens de serviço totalmente implementado:
  * Corrigido problema principal: falta de endpoints e métodos para gerenciar produtos utilizados
  * Implementado sistema completo: storage, rotas API, modal de gerenciamento
  * Criado botão "Finalizar OS" que muda status para entregue e cria entrada financeira
  * Removidas todas referências ao Supabase, sistema 100% PostgreSQL
  * Interface moderna para adicionar produtos cadastrados ou peças avulsas
  * Visualização de OS atualizada com produtos/serviços e botões funcionais
- July 1, 2025. Dashboard redesenhado com foco em informações relevantes:
  * Removidas seções "Próximos Passos" e "Status Operacional" desnecessárias
  * Mantida apenas grid de cards com métricas importantes do negócio
  * Adicionado card "Valor OS Abertas" mostrando soma total das ordens em aberto
  * Layout simplificado com todos os cards principais em uma única seção
  * Alertas de estoque baixo mantidos quando aplicáveis
- July 1, 2025. Padronização completa de ícones nos menus de ações:
  * Substituído texto "Ações" por ícone MoreHorizontal em todas as tabelas
  * Ícones Edit e Trash2 padronizados em todas as páginas (Clientes, Produtos, Ordens, Financeiro)
  * Interface visual mais limpa e moderna com botões de ação consistentes
  * Mantida funcionalidade de tooltips para acessibilidade
- July 1, 2025. Rebranding completo do sistema para "OS Cloud":
  * Sistema rebatizado de TechService para OS Cloud em toda a aplicação
  * Novo logo SVG criado e implementado no componente OSCloudLogo
  * Atualização de todas as referências em Header, Sidebar, Landing Page, Home Page, Login, Cadastro
  * Dados de teste atualizados de "admin@techservice.com" para "admin@oscloud.com"
  * Documentação e descrição do sistema atualizadas para refletir novo nome
  * Identidade visual unificada com novo nome e logo em 100% das páginas do sistema
- July 1, 2025. Repaginação completa do Dashboard:
  * Cards redimensionados para layout mais compacto (5 colunas em desktop)
  * Seção de "Ações Rápidas" com botões coloridos para navegação rápida
  * Tabela de "Últimas Ordens de Serviço" com status coloridos e botões de ação
  * Menu dropdown com ícones para visualizar/editar ordens diretamente do Dashboard
  * Layout otimizado focado em funcionalidades práticas e navegação eficiente
- July 1, 2025. Proteção de entradas financeiras vinculadas a OS:
  * Sistema agora impede exclusão de receitas geradas automaticamente por OS
  * Adicionado campo ordem_servico_id nas entradas financeiras
  * Badge "Vinculado à OS" exibido na tabela para identificar origem
  * Mensagem explicativa quando usuário tenta excluir entrada protegida
  * Integração completa entre módulos de OS e financeiro com rastreabilidade
- July 1, 2025. Landing page e logo completamente repaginadas:
  * Nova logo OS Cloud com SVG moderno e gradientes profissionais
  * Design contemporâneo com nuvem, documento e engrenagem integrados
  * Landing page totalmente redesenhada com layout moderno
  * Seção hero com gradientes e animações suaves
  * Cards de recursos com gradientes coloridos distintos
  * Seção de estatísticas, depoimentos e call-to-action
  * Footer profissional com links organizados
  * Design responsivo otimizado para todos os dispositivos
- July 1, 2025. Simplificação da landing page conforme solicitado:
  * Removido footer completo para layout mais limpo
  * Removido botão "Ver Demonstração" mantendo apenas "Começar Grátis"
  * Cards de recursos redimensionados para tamanho mais compacto
  * Menu de navegação simplificado com apenas "Recursos" e "Depoimentos"
  * Layout focado essencialmente no cadastro de novos usuários
- July 1, 2025. Sistema de proteção robusta para OS com vínculos financeiros:
  * Implementada lógica completa de validação para edição/exclusão de OS vinculadas
  * Proteção backend: valores e status de OS não podem ser alterados se houver vínculos financeiros
  * Sistema inteligente de exclusão: oferece opções para excluir ou manter entradas financeiras
  * Dashboard com seção "Integridade de Dados Financeiros" mostrando métricas importantes
  * Cards especiais indicando OS protegidas, receitas vinculadas e alertas de situações críticas
  * Validação no banco: verificação automática de vínculos antes de qualquer alteração
  * Interface de usuário intuitiva com confirmações e opções claras para o usuário
  * Sistema não prejudica funcionamento normal, apenas adiciona camadas de proteção
- July 1, 2025. Sistema "soft delete" para produtos com proteção de integridade histórica:
  * Implementado soft delete: produtos são marcados como inativos ao invés de excluídos fisicamente
  * Preserva integridade de dados históricos - produtos vinculados a OS permanecem acessíveis
  * Consulta de produtos filtrada para mostrar apenas itens ativos na interface
  * Interface atualizada com mensagem explicativa sobre inativação vs exclusão
  * Elimina erros de chave estrangeira ao tentar excluir produtos em uso
  * Solução robusta que mantém consistência dos dados em todas as operações
- July 1, 2025. INTEGRAÇÃO FINANCEIRA FINALIZADA E TESTADA COM SUCESSO:
  * Corrigido problema crítico do campo 'categoria' obrigatório no banco de dados
  * Removida chamada HTTP duplicada que causava erro 401 na criação de entradas
  * Sistema automatizado 100% funcional: OS finalizada → entrada financeira criada automaticamente
  * Testado e confirmado funcionamento: OS #000003 gerou entrada financeira ID c343fc36-dffd-43de-8b7d-270c21021ccd
  * Dashboard limpo: removida seção de integridade de dados desnecessária
  * Sistema completo e pronto para deploy em produção
- July 1, 2025. OTIMIZAÇÃO MOBILE COMPLETA MANTENDO VERSÕES DESKTOP INTACTAS:
  * Todas as páginas principais otimizadas: Dashboard, Ordens, Clientes, Produtos, Financeiro, Empresa
  * Navegação mobile: menu hamburger com overlay e transições suaves
  * Layout responsivo: cards mobile vs tabelas desktop, breakpoints lg (1024px+)
  * Header responsivo: versão simplificada mobile, informações completas desktop
  * Sidebar: navegação fixa desktop (lg:static) + overlay mobile (fixed)
  * Sistema 100% funcional em ambas as versões mantendo todas as funcionalidades
- July 1, 2025. AJUSTES FINAIS DE IMPRESSÃO E FONTES DESKTOP:
  * Fontes desktop aumentadas sutilmente para melhor legibilidade (15px base, +0.05-0.075rem)
  * CSS de impressão totalmente otimizado: eliminada barra de rolagem e páginas duplicadas
  * Impressão forçada para página única com overflow hidden em todos os elementos
  * Sistema finalizado e pronto para deploy com todas as funcionalidades operacionais
- July 1, 2025. SISTEMA DE IMPRESSÃO E DOWNLOAD PDF COMPLETAMENTE IMPLEMENTADO:
  * Botão "Download PDF" adicionado em modal de visualização de OS usando jsPDF e html2canvas
  * Funcionalidade de impressão corrigida para abrir página dedicada de impressão
  * CSS de impressão otimizado para melhor qualidade e eliminação de problemas visuais
  * Ambas as funcionalidades (impressão e download PDF) totalmente operacionais
  * Interface moderna com botões coloridos distintos para cada ação
- July 1, 2025. INTEGRAÇÃO DINÂMICA DE DADOS DA EMPRESA:
  * Removidos dados fixos da empresa em VisualizacaoOS e OrdemPrintView
  * Integração completa com dados do perfil da empresa vindo do banco de dados
  * Informações atualizadas automaticamente quando empresa é modificada na página Empresa
  * Sistema totalmente dinâmico: nome, CNPJ, endereço, telefone e email vindos do profile
  * Fallbacks informativos quando dados não estão cadastrados ("Não informado")
- July 1, 2025. CAMPOS DE ASSINATURA IMPLEMENTADOS NAS ORDENS DE SERVIÇO:
  * Seção completa de assinaturas adicionada na visualização das OS
  * Campos para assinatura do cliente e do técnico responsável
  * Termo de responsabilidade com informações de garantia dinâmicas
  * Campos de data de entrega para preenchimento manual
  * Integração em todos os formatos: visualização, impressão e download PDF
  * Layout profissional com espaços adequados para assinaturas físicas
  * Layout otimizado: assinaturas lado a lado horizontalmente, mais compacto
  * Alturas reduzidas (h-10) para melhor aproveitamento de espaço na impressão
- July 2, 2025. IMPLEMENTAÇÃO PADRÃO DE DADOS DA EMPRESA EM CABEÇALHOS OS:
  * Corrigido problema: VisualizacaoOS usava useQuery incorretamente para buscar profile
  * Solução padrão implementada: usar sempre useAuth() do contexto para acessar profile
  * Dados da empresa agora aparecem corretamente em todas as visualizações de OS
  * Padrão estabelecido: NUNCA usar useQuery para profile, sempre useAuth context
  * OrdemPrintView recebe profile como parâmetro corretamente via props
  * Sistema validado: empresa "Rp Informática Teste" com todos os dados exibidos
  * Regra para futuras implementações: componentes que precisam de dados da empresa devem usar useAuth()

## Best Practices para Assistências Técnicas

### Integração de Dados da Empresa
**REGRA FUNDAMENTAL**: Componentes que precisam exibir dados da empresa devem SEMPRE usar o contexto de autenticação:

```typescript
// ✅ CORRETO - usar contexto de autenticação
import { useAuth } from '@/contexts/AuthContext';
const { profile } = useAuth();

// ❌ INCORRETO - NÃO usar useQuery para profile
const { data: profile } = useQuery({ queryKey: ['/api/profile'] });
```

### Exibição de Dados da Empresa em Cabeçalhos
- **Nome da empresa**: `profile?.empresa || 'Nome da Empresa'`
- **CNPJ e IE**: Exibir apenas se existirem
- **Endereço completo**: Construir dinamicamente com fallbacks
- **Contatos**: Telefone, email_empresa e site com verificação de existência

### Padrão de Fallbacks
- Usar condicionais `{profile?.campo && <elemento>}` para campos opcionais
- Sempre fornecer fallbacks informativos para campos essenciais
- Construir endereços dinamicamente evitando campos vazios

## User Preferences

Preferred communication style: Português brasileiro (PT-BR), linguagem simples e cotidiana.