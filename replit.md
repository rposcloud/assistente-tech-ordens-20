# TechService - Sistema de Gestão para Assistência Técnica

## Overview

TechService is a comprehensive web application designed for technical service management, built with a modern full-stack architecture. The system enables businesses to manage clients, service orders, products/services, and financial operations through an intuitive interface. It includes a customer portal feature for order tracking and supports various equipment types (smartphones, notebooks, desktops, tablets).

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

## User Preferences

Preferred communication style: Simple, everyday language.