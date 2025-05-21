// src/routes/index.js
import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layout
import DashboardLayout from '../components/layout/DashboardLayout'

// Páginas
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import ProductsPage from '../pages/ProductsPage'
import ProductDetailsPage from '../pages/ProductDetailsPage'
import CreateProductPage from '../pages/CreateProductPage'
import EditProductPage from '../pages/EditProductPage'
import InventoryPage from '../pages/InventoryPage'
import SalesPage from '../pages/SalesPage'
import CustomersPage from '../pages/CustomersPage'
import SuppliersPage from '../pages/SuppliersPage'
import SupplierDetailsPage from '../pages/SupplierDetailsPage'
import CreateSupplierPage from '../pages/CreateSupplierPage'
import EditSupplierPage from '../pages/EditSupplierPage'
import PurchaseOrdersPage from '../pages/PurchaseOrdersPage'
import ReportsPage from '../pages/ReportsPage'
import SettingsPage from '../pages/SettingsPage'
import ProfilePage from '../pages/ProfilePage'

// Nuevas páginas de gestión de usuarios
import UsersPage from '../pages/UsersPage'
import CreateUserPage from '../pages/CreateUserPage'
import EditUserPage from '../pages/EditUserPage'

// Página 404
const NotFound = () => <div>Página no encontrada</div>

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <NotFound />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <NotFound />,
    children: [
      // Ruta por defecto (index) - Puede redirigir a /dashboard o mostrar el dashboard directamente
      { index: true, element: <DashboardPage /> },
      
      // Dashboard - Añadimos esta ruta para que /dashboard funcione
      { path: 'dashboard', element: <DashboardPage /> },

      // Productos - Corregimos el orden (rutas específicas antes que rutas con parámetros)
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/new', element: <Navigate to="/products/create" replace /> },
      { path: 'products/new', element: <CreateProductPage /> },
      { path: 'products/edit/:id', element: <EditProductPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },

      // Inventario
      { path: 'inventory', element: <InventoryPage /> },

      // Ventas
      { path: 'sales', element: <SalesPage /> },

      // Clientes
      { path: 'customers', element: <CustomersPage /> },

      // Proveedores - Corregimos el orden (rutas específicas antes que rutas con parámetros)
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'suppliers/create', element: <CreateSupplierPage /> },
      { path: 'suppliers/edit/:id', element: <EditSupplierPage /> },
      { path: 'suppliers/:id', element: <SupplierDetailsPage /> },

      // Órdenes de compra
      { path: 'purchase-orders', element: <PurchaseOrdersPage /> },

      // Usuarios
      { path: 'users', element: <UsersPage /> },
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
])

export default router