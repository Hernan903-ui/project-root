import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  MenuItem,
  FormGroup,
  Checkbox,
  ListItemText,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUsers, 
  fetchRoles,
  createUser, 
  updateUser, 
  deleteUser,
  updateUserPermissions,
  setSelectedUser, 
  clearSelectedUser
} from '../../features/settings/settingsSlice';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { 
    users, 
    roles,
    usersLoading, 
    rolesLoading,
    selectedUser, 
    error, 
    successMessage 
  } = useSelector(state => state.settings);
  
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    active: true,
    phone: '',
    position: ''
  });
  const [permissions, setPermissions] = useState({
    canManageUsers: false,
    canManageProducts: false,
    canManageInventory: false,
    canViewReports: false,
    canProcessSales: false,
    canManageSettings: false,
    canViewCustomers: false,
    canManageCustomers: false,
    canCancelSales: false,
    canApplyDiscounts: false
  });
  
  // Cargar usuarios y roles al montar el componente
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);
  
  // Actualizar formulario cuando se selecciona un usuario para editar
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        id: selectedUser.id,
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        email: selectedUser.email || '',
        password: '',
        role: selectedUser.role || 'user',
        active: selectedUser.active !== false,
        phone: selectedUser.phone || '',
        position: selectedUser.position || ''
      });
      
      if (selectedUser.permissions) {
        setPermissions(selectedUser.permissions);
      }
    }
  }, [selectedUser]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handlePermissionChange = (name) => (e) => {
    setPermissions({
      ...permissions,
      [name]: e.target.checked
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleOpenAddDialog = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
      active: true,
      phone: '',
      position: ''
    });
    setOpenDialog(true);
  };
  
  const handleOpenEditDialog = (user) => {
    dispatch(setSelectedUser(user));
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(clearSelectedUser());
  };
  
  const handleOpenDeleteDialog = (user) => {
    dispatch(setSelectedUser(user));
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    dispatch(clearSelectedUser());
  };
  
  const handleOpenPermissionsDialog = (user) => {
    dispatch(setSelectedUser(user));
    setOpenPermissionsDialog(true);
  };
  
  const handleClosePermissionsDialog = () => {
    setOpenPermissionsDialog(false);
    dispatch(clearSelectedUser());
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      dispatch(updateUser({ id: selectedUser.id, userData: formData }));
    } else {
      dispatch(createUser(formData));
    }
    setOpenDialog(false);
  };
  
  const handleSavePermissions = () => {
    if (selectedUser) {
      dispatch(updateUserPermissions({ id: selectedUser.id, permissions }));
      setOpenPermissionsDialog(false);
    }
  };
  
  const handleDelete = () => {
    if (selectedUser) {
      dispatch(deleteUser(selectedUser.id));
      setOpenDeleteDialog(false);
    }
  };
  
  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return (
      fullName.includes(query) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.role && user.role.toLowerCase().includes(query))
    );
  });
  
    // Obtener el color y texto basado en el rol
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { color: 'error', label: 'Administrador', icon: <AdminIcon fontSize="small" /> };
      case 'manager':
        return { color: 'warning', label: 'Gerente', icon: <PersonIcon fontSize="small" /> };
      case 'user':
        return { color: 'info', label: 'Usuario', icon: <PersonIcon fontSize="small" /> };
      default:
        return { color: 'default', label: role, icon: <PersonIcon fontSize="small" /> };
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Usuarios" />
          <Tab label="Roles y Permisos" />
        </Tabs>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {tabValue === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <TextField
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={handleOpenAddDialog}
            >
              Nuevo Usuario
            </Button>
          </Box>
          
          {usersLoading && !users.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => {
                      const roleInfo = getRoleInfo(user.role);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ mr: 2, bgcolor: user.active ? 'primary.main' : 'grey.400' }}
                                src={user.avatarUrl}
                              >
                                {user.firstName ? user.firstName[0] : ''}
                                {user.lastName ? user.lastName[0] : ''}
                              </Avatar>
                              <Box>
                                <Typography variant="body1">
                                  {user.firstName} {user.lastName}
                                </Typography>
                                {user.position && (
                                  <Typography variant="caption" color="text.secondary">
                                    {user.position}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              icon={roleInfo.icon}
                              label={roleInfo.label}
                              color={roleInfo.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Switch
                              checked={user.active}
                              onChange={() => {
                                const updatedUser = { ...user, active: !user.active };
                                dispatch(updateUser({ id: user.id, userData: updatedUser }));
                              }}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditDialog(user)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleOpenPermissionsDialog(user)}
                              >
                                <LockIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(user)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {searchQuery ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios configurados'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      {tabValue === 1 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Roles del Sistema
          </Typography>
          
          <Typography variant="body2" paragraph>
            Los roles determinan qué puede hacer cada usuario en el sistema. Aquí puede configurar los permisos predeterminados para cada rol.
          </Typography>
          
          {rolesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Administrador
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Acceso completo a todas las funciones del sistema. Puede gestionar usuarios, configuraciones, y realizar todas las operaciones.
                  </Typography>
                  <Chip label="Acceso Total" color="success" />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Gerente
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Puede gestionar productos, ventas, inventario y ver reportes. No puede modificar configuraciones del sistema ni gestionar usuarios.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="Ventas" color="primary" size="small" />
                    <Chip label="Reportes" color="primary" size="small" />
                    <Chip label="Inventario" color="primary" size="small" />
                    <Chip label="Clientes" color="primary" size="small" />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Usuario
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Solo puede procesar ventas y ver productos. Acceso limitado a funciones del sistema.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="Ventas" color="primary" size="small" />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Para cambiar los permisos específicos de un usuario, diríjase a la pestaña "Usuarios" y utilice el botón de permisos en las acciones del usuario.
          </Typography>
        </Box>
      )}
      
      {/* Diálogo para añadir/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="firstName"
                  label="Nombre"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="lastName"
                  label="Apellido"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="phone"
                  label="Teléfono"
                  value={formData.phone}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="position"
                  label="Cargo"
                  value={formData.position}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="role"
                  label="Rol"
                  value={formData.role}
                  onChange={handleInputChange}
                  fullWidth
                  required
                >
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="manager">Gerente</MenuItem>
                  <MenuItem value="user">Usuario</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label={selectedUser ? "Nueva Contraseña (dejar en blanco para mantener)" : "Contraseña"}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  required={!selectedUser}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={handleInputChange}
                      name="active"
                      color="primary"
                    />
                  }
                  label="Usuario activo"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            startIcon={usersLoading ? <CircularProgress size={20} color="inherit" /> : null}
            disabled={usersLoading || !formData.firstName || !formData.lastName || !formData.email || (!selectedUser && !formData.password)}
          >
            {usersLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar al usuario "{selectedUser?.firstName} {selectedUser?.lastName}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            startIcon={usersLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            disabled={usersLoading}
          >
            {usersLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para gestionar permisos de usuario */}
      <Dialog open={openPermissionsDialog} onClose={handleClosePermissionsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Permisos de Usuario: {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure los permisos específicos para este usuario. Estos ajustes sobrescribirán los permisos predeterminados asignados a su rol.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Acceso al Sistema
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canManageUsers}
                      onChange={handlePermissionChange('canManageUsers')}
                    />
                  }
                  label="Gestionar usuarios"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canManageSettings}
                      onChange={handlePermissionChange('canManageSettings')}
                    />
                  }
                  label="Administrar configuración del sistema"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canViewReports}
                      onChange={handlePermissionChange('canViewReports')}
                    />
                  }
                  label="Ver reportes"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Productos e Inventario
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canManageProducts}
                      onChange={handlePermissionChange('canManageProducts')}
                    />
                  }
                  label="Gestionar productos"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canManageInventory}
                      onChange={handlePermissionChange('canManageInventory')}
                    />
                  }
                  label="Gestionar inventario"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Ventas
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canProcessSales}
                      onChange={handlePermissionChange('canProcessSales')}
                    />
                  }
                  label="Procesar ventas"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canCancelSales}
                      onChange={handlePermissionChange('canCancelSales')}
                    />
                  }
                  label="Cancelar ventas"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canApplyDiscounts}
                      onChange={handlePermissionChange('canApplyDiscounts')}
                    />
                  }
                  label="Aplicar descuentos"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Clientes
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canViewCustomers}
                      onChange={handlePermissionChange('canViewCustomers')}
                    />
                  }
                  label="Ver clientes"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions.canManageCustomers}
                      onChange={handlePermissionChange('canManageCustomers')}
                    />
                  }
                  label="Gestionar clientes"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionsDialog}>Cancelar</Button>
          <Button 
            onClick={handleSavePermissions} 
            color="primary" 
            variant="contained"
            startIcon={usersLoading ? <CircularProgress size={20} color="inherit" /> : null}
            disabled={usersLoading}
          >
            {usersLoading ? 'Guardando...' : 'Guardar Permisos'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserManagement;