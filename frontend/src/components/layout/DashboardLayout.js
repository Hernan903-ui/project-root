//src/components/layout/DashboardLayout.js
import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Tooltip,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as POSIcon,
  Inventory as InventoryIcon,
  Category as ProductsIcon,
  People as CustomersIcon,
  Receipt as SalesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  LocalShipping as SupplierIcon,
  ShoppingBasket as PurchaseOrderIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import TextSizeAdjuster from '../common/TextSizeAdjuster';
import ThemeToggle from '../common/ThemeToggle';
import NotificationCenter from '../common/NotificationCenter';
import SkipLink from '../common/SkipLink';
import { useNotification } from '../../context/NotificationContext';

const drawerWidth = 240;

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notify } = useNotification();

  // Mock notifications para el ejemplo
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Inventario bajo',
      message: 'Varios productos están por debajo del stock mínimo',
      type: 'warning',
      read: false,
      timestamp: new Date().toISOString(),
      actionLabel: 'Ver Inventario',
      actionPath: '/inventory'
    },
    {
      id: '2',
      title: 'Venta completada',
      message: 'Venta #1234 completada exitosamente',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    }
  ]);

  const handleDrawerToggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const handleProfileMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
    notify('Sesión cerrada exitosamente', 'info');
  }, [dispatch, navigate, notify]);

  const handleNavigate = useCallback((path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  }, [navigate, isMobile]);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Punto de Venta', icon: <POSIcon />, path: '/pos' },
    { text: 'Productos', icon: <ProductsIcon />, path: '/products' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Proveedores', icon: <SupplierIcon />, path: '/suppliers' },
    { text: 'Órdenes de Compra', icon: <PurchaseOrderIcon />, path: '/purchase-orders' },
    { text: 'Clientes', icon: <CustomersIcon />, path: '/customers' },
    { text: 'Ventas', icon: <SalesIcon />, path: '/sales' },
    { text: 'Reportes', icon: <ReportsIcon />, path: '/reports' },
  ];

  // Menú adicional para la configuración y perfil
  const bottomMenuItems = [
    { text: 'Mi Perfil', icon: <ProfileIcon />, path: '/profile' },
    user?.role === 'admin' ? { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' } : null,
  ].filter(Boolean); // Filter out null items

  const handleNotificationRead = useCallback((id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const handleNotificationAction = useCallback((id) => {
    setNotifications((prevNotifications) => {
      const notification = prevNotifications.find((n) => n.id === id);
      if (notification && notification.actionPath) {
        navigate(notification.actionPath);
        return prevNotifications.map((n) => 
          n.id === id ? { ...n, read: true } : n
        );
      }
      return prevNotifications;
    });
  }, [navigate]);

  const handleClearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const isActive = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }, [location.pathname]);

  const activeMenuTitle = menuItems.find(item => isActive(item.path))?.text || 'Dashboard';

  const drawer = (
    <>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: 2
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          POS System
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} size="large" edge="end" aria-label="cerrar menú">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List component="nav" aria-label="main navigation">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 1,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.12)' 
                    : 'rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.16)' 
                      : 'rgba(0, 0, 0, 0.12)',
                  }
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 1,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.12)' 
                    : 'rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <SkipLink mainContentId="main-content" />
      
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={open ? 'cerrar menú' : 'abrir menú'}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {activeMenuTitle}
          </Typography>
          
          <NotificationCenter 
            notifications={notifications} 
            onRead={handleNotificationRead} 
            onClearAll={handleClearAllNotifications}
            onAction={handleNotificationAction}
          />

          <Box sx={{ mx: 1 }}>
            <TextSizeAdjuster />
          </Box>
          <Box sx={{ mx: 1 }}>
            <ThemeToggle />
          </Box>
          
          <Tooltip title="Cuenta">
            <IconButton
              size="large"
              edge="end"
              aria-label="cuenta de usuario"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar
                alt={user?.name || 'Usuario'}
                src={user?.avatar || '/static/images/avatar/default.jpg'}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mi Perfil</ListItemText>
            </MenuItem>
            {user?.role === 'admin' && (
              <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Configuración</ListItemText>
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="menu principal"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={isMobile && open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderRightColor: 'divider'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderRightColor: 'divider'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          pt: { xs: 8, sm: 9 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;