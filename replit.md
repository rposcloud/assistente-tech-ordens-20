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
  * Atualização de todas as referências em Header, Sidebar, Landing Page, Home Page
  * Documentação e descrição do sistema atualizadas para refletir novo nome
  * Identidade visual unificada com novo nome e logo em todas as páginas

## User Preferences

Preferred communication style: Português brasileiro (PT-BR), linguagem simples e cotidiana.