// src/pages/UsersPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Stack,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LockOpen as LockOpenIcon,
  LockOutlined as LockIcon
} from '@mui/icons-material';

import { 
  fetchUsers, 
  deleteUser, 
  setUserStatus,
  selectAllUsers,
  selectUsersLoading,
  selectUsersError,
  selectUsersTotal
} from '../features/users/userSlice';

const UsersPage = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const totalUsers = useSelector(selectUsersTotal);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Cargar usuarios cuando cambie la página, filas por página o término de búsqueda
  useEffect(() => {
    const params = {
      skip: page * rowsPerPage,
      limit: rowsPerPage,
      search: searchTerm || undefined
    };
    dispatch(fetchUsers(params));
  }, [dispatch, page, rowsPerPage, searchTerm]);

  // Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete.id))
        .unwrap()
        .then(() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        });
    }
  };

  const handleToggleUserStatus = (user) => {
    dispatch(setUserStatus({ id: user.id, isActive: !user.is_active }));
  };

  // Render functions
  const renderUserStatus = (user) => {
    if (user.is_active) {
      return (
        <Tooltip title="Desactivar usuario">
          <Chip
            icon={<LockOpenIcon fontSize="small" />}
            label="Activo"
            color="success"
            variant="outlined"
            onClick={() => handleToggleUserStatus(user)}
            sx={{ cursor: 'pointer' }}
          />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Activar usuario">
        <Chip
          icon={<LockIcon fontSize="small" />}
          label="Inactivo"
          color="error"
          variant="outlined"
          onClick={() => handleToggleUserStatus(user)}
          sx={{ cursor: 'pointer' }}
        />
      </Tooltip>
    );
  };

  if (loading && !users.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Usuarios
          </Typography>
          <Button
            component={Link}
            to="/users/create"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Nuevo Usuario
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role || 'Usuario'}
                    </TableCell>
                    <TableCell>
                      {renderUserStatus(user)}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar usuario">
                        <IconButton
                          component={Link}
                          to={`/users/edit/${user.id}`}
                          color="primary"
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar usuario">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "No se encontraron usuarios"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalUsers || users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      </Box>

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar al usuario {userToDelete?.full_name || userToDelete?.email}? 
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;