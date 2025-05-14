// src/routes/index.js
import React from 'react'
import { createBrowserRouter } from 'react-router-dom'

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
      // Ruta por defecto (index)
      { index: true, element: <DashboardPage /> },

      // Productos
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
      { path: 'products/create', element: <CreateProductPage /> },
      { path: 'products/edit/:id', element: <EditProductPage /> },

      // Inventario
      { path: 'inventory', element: <InventoryPage /> },

      // Ventas
      { path: 'sales', element: <SalesPage /> },

      // Clientes
      { path: 'customers', element: <CustomersPage /> },

      // Proveedores
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'suppliers/:id', element: <SupplierDetailsPage /> },
      { path: 'suppliers/create', element: <CreateSupplierPage /> },
      { path: 'suppliers/edit/:id', element: <EditSupplierPage /> },

      // Órdenes de compra
      { path: 'purchase-orders', element: <PurchaseOrdersPage /> },

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