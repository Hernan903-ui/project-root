import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useQuery } from 'react-query';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { getCustomers } from '../../api/posApi';
import { setCustomer, selectCartCustomer } from '../../features/pos/cartSlice';

const CustomerSelect = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const currentCustomer = useSelector(selectCartCustomer);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading, refetch } = useQuery(
    ['customers', searchTerm],
    () => getCustomers(searchTerm),
    {
      enabled: open,
    }
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length >= 2 || e.target.value.length === 0) {
      refetch();
    }
  };

  const handleSelectCustomer = (customer) => {
    dispatch(setCustomer(customer));
    onClose();
  };

  const handleRemoveCustomer = () => {
    dispatch(setCustomer(null));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Seleccionar Cliente</DialogTitle>
      <DialogContent dividers>
        {currentCustomer && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cliente Actual:
            </Typography>
            <Box display="flex" alignItems="center">
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {currentCustomer.name}
              </Typography>
            </Box>
            {currentCustomer.email && (
              <Typography variant="body2" color="text.secondary">
                Email: {currentCustomer.email}
              </Typography>
            )}
            {currentCustomer.phone && (
              <Typography variant="body2" color="text.secondary">
                Teléfono: {currentCustomer.phone}
              </Typography>
            )}
            <Button 
              variant="outlined" 
              color="error" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={handleRemoveCustomer}
            >
              Quitar Cliente
            </Button>
          </Box>
        )}

        <TextField
          fullWidth
          label="Buscar clientes"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Nombre, email o teléfono..."
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <ListItem disablePadding key={customer.id} divider>
                  <ListItemButton onClick={() => handleSelectCustomer(customer)}>
                    <ListItemText
                      primary={customer.name}
                      secondary={
                        <>
                          {customer.email && (
                            <Typography variant="body2" component="span" display="block">
                              Email: {customer.email}
                            </Typography>
                          )}
                          {customer.phone && (
                            <Typography variant="body2" component="span" display="block">
                              Teléfono: {customer.phone}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
                No se encontraron clientes. Intente con otra búsqueda.
              </Typography>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerSelect;