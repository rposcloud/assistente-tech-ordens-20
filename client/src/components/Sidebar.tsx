
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, FileText, Home, LogOut, Package, DollarSign, Building2, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OSCloudLogo } from './OSCloudLogo';

export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Ordens de Serviço', path: '/ordens' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Package, label: 'Produtos & Serviços', path: '/produtos' },
    { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
    { icon: Building2, label: 'Empresa', path: '/empresa' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Botão Menu Mobile */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-gray-200"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Desktop + Mobile */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full
        transition-transform duration-300 ease-in-out lg:transition-none
      `}>
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <OSCloudLogo size="md" />
        </div>
        
        <nav className="mt-4 lg:mt-6 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center px-4 lg:px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive(item.path) ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span className="text-sm lg:text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 lg:p-6 mt-auto">
          <button
            onClick={() => {
              logout();
              closeMobileMenu();
            }}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            <span className="text-sm lg:text-base">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};
