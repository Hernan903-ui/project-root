// src/routes/index.js
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Páginas de autenticación
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Páginas de dashboard
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CreateProductPage from '../pages/CreateProductPage';
import EditProductPage from '../pages/EditProductPage';
import InventoryPage from '../pages/InventoryPage';
import SalesPage from '../pages/SalesPage';
import CustomersPage from '../pages/CustomersPage';
import SuppliersPage from '../pages/SuppliersPage';
import SupplierDetailsPage from '../pages/SupplierDetailsPage';
import CreateSupplierPage from '../pages/CreateSupplierPage';
import EditSupplierPage from '../pages/EditSupplierPage';
import PurchaseOrdersPage from '../pages/PurchaseOrdersPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';

// Páginas de gestión de usuarios
import UsersPage from '../pages/UsersPage';
import CreateUserPage from '../pages/CreateUserPage';
import EditUserPage from '../pages/EditUserPage';

// Página 404
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="text-xl mb-6">Página no encontrada</p>
    <button 
      onClick={() => window.location.href = '/'}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Volver al inicio
    </button>
  </div>
);

const router = createBrowserRouter([
  // Rutas de acceso público
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <NotFound />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <NotFound />,
  },
  // Rutas protegidas por dashboard layout
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <NotFound />,
    children: [
      // Ruta por defecto (index)
      { index: true, element: <DashboardPage /> },
      
      // Dashboard
      { path: 'dashboard', element: <DashboardPage /> },

      // Productos
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/create', element: <CreateProductPage /> },
      { path: 'products/new', element: <Navigate to="/products/create" replace /> },
      { path: 'products/edit/:id', element: <EditProductPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },

      // Inventario
      { path: 'inventory', element: <InventoryPage /> },

      // Ventas
      { path: 'sales', element: <SalesPage /> },

      // Clientes
      { path: 'customers', element: <CustomersPage /> },

      // Proveedores
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'suppliers/new', element: <Navigate to="/suppliers/create" replace /> },
      { path: 'suppliers/create', element: <CreateSupplierPage /> },
      { path: 'suppliers/edit/:id', element: <EditSupplierPage /> },
      { path: 'suppliers/:id', element: <SupplierDetailsPage /> },

      // Órdenes de compra
      { path: 'purchase-orders', element: <PurchaseOrdersPage /> },

      // Usuarios
      { path: 'users', element: <UsersPage /> },
      { path: 'users/new', element: <Navigate to="/users/create" replace /> },
      { path: 'users/create', element: <CreateUserPage /> },
      { path: 'users/edit/:id', element: <EditUserPage /> },

      // Reportes, configuración y perfil
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },

      // Cualquier otra ruta bajo '/' → 404
      { path: '*', element: <NotFound /> },
    ],
  },
  // Ruta de captura para cualquier otra URL no definida
  {
    path: '*',
    element: <Navigate to="/login" replace />,
    errorElement: <NotFound />,
  },
]);

export default router;