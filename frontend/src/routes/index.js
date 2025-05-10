import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import POSPage from '../pages/POSPage';
import ProductsPage from '../pages/ProductsPage';
import CreateProductPage from '../pages/CreateProductPage';
import EditProductPage from '../pages/EditProductPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import InventoryPage from '../pages/InventoryPage';
import CustomersPage from '../pages/CustomersPage';
import SalesPage from '../pages/SalesPage';
import ReportsPage from '../pages/ReportsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import SuppliersPage from '../pages/SuppliersPage';
import CreateSupplierPage from '../pages/CreateSupplierPage';
import EditSupplierPage from '../pages/EditSupplierPage';
import SupplierDetailsPage from '../pages/SupplierDetailsPage';
import PurchaseOrdersPage from '../pages/PurchaseOrdersPage';
import CreatePurchaseOrderPage from '../pages/CreatePurchaseOrderPage';
import EditPurchaseOrderPage from '../pages/EditPurchaseOrderPage';
import PurchaseOrderDetailsPage from '../pages/PurchaseOrderDetailsPage';
import ReceiveInventoryPage from '../pages/ReceiveInventoryPage';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para rutas que requieren permisos de administrador
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar si el usuario tiene permisos de administrador
  if (user && (user.role !== 'admin' && !user.permissions?.canManageSettings)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas protegidas con layout de dashboard */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Rutas de productos */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<CreateProductPage />} />
        <Route path="products/edit/:id" element={<EditProductPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        
        {/* Rutas de Punto de Venta */}
        <Route path="pos" element={<POSPage />} />
        
        {/* Rutas de inventario */}
        <Route path="inventory" element={<InventoryPage />} />
        
        {/* Rutas de clientes */}
        <Route path="customers" element={<CustomersPage />} />
        
        {/* Rutas de ventas */}
        <Route path="sales" element={<SalesPage />} />
        
        {/* Rutas de reportes */}
        <Route path="reports" element={<ReportsPage />} />
        
        {/* Ruta de perfil de usuario */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Rutas de proveedores */}
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/create" element={<CreateSupplierPage />} />
        <Route path="suppliers/edit/:id" element={<EditSupplierPage />} />
        <Route path="suppliers/:id" element={<SupplierDetailsPage />} />
        
        {/* Rutas de órdenes de compra */}
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="purchase-orders/create" element={<CreatePurchaseOrderPage />} />
        <Route path="purchase-orders/edit/:id" element={<EditPurchaseOrderPage />} />
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
        <Route path="purchase-orders/:id/receive" element={<ReceiveInventoryPage />} />
        
        {/* Ruta de configuración - Solo para administradores */}
        <Route 
          path="settings" 
          element={
            <AdminRoute>
              <SettingsPage />
            </AdminRoute>
          } 
        />
      </Route>
      
      {/* Ruta para manejar rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;