
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { apiRequest } from './lib/api';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Produtos } from './pages/Produtos';
import { Ordens } from './pages/Ordens';
import { NovaOrdem } from './pages/NovaOrdem';
import { Financeiro } from './pages/Financeiro';
import { Empresa } from './pages/Empresa';
import { PortalCliente } from './pages/PortalCliente';
import { ImpressaoOrdemDedicada } from './pages/ImpressaoOrdemDedicada';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        // Para queryKeys que começam com /, adiciona /api automaticamente
        const endpoint = url.startsWith('/') ? url : `/${url}`;
        return apiRequest(endpoint);
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/portal/:token" element={<PortalCliente />} />
            <Route path="/impressao-ordem/:id" element={<ImpressaoOrdemDedicada />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/empresa" element={
              <ProtectedRoute>
                <Layout>
                  <Empresa />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/produtos" element={
              <ProtectedRoute>
                <Layout>
                  <Produtos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ordens" element={
              <ProtectedRoute>
                <Layout>
                  <Ordens />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ordens/nova" element={
              <ProtectedRoute>
                <Layout>
                  <NovaOrdem />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute>
                <Layout>
                  <Financeiro />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
