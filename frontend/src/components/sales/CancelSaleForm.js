import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CancelSaleForm = ({ sale, onCancel, loading, error }) => {
  const [reason, setReason] = useState('');

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      return;
    }
    onCancel({ id: sale.id, reason });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (!sale) return null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cancelar Venta #{sale.receiptNumber || sale.id}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Fecha de venta: {formatDate(sale.date)}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'error.lighter' }}>
        <Typography variant="body1" color="error" gutterBottom>
          Advertencia
        </Typography>
        <Typography variant="body2">
          Esta acción cancelará la venta y no se puede deshacer. Se reversan los inventarios y se registrará como cancelada en el sistema.
        </Typography>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        label="Motivo de la cancelación"
        multiline
        rows={3}
        fullWidth
        value={reason}
        onChange={handleReasonChange}
        placeholder="Indique el motivo de la cancelación"
        required
        sx={{ mb: 3 }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">
          Total de la venta: ${sale.total.toFixed(2)}
        </Typography>
        <Typography variant="subtitle1">
          Cliente: {sale.customer ? sale.customer.name : 'Cliente no registrado'}
        </Typography>
      </Box>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="error"
          disabled={!reason.trim() || loading}
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Procesando...' : 'Confirmar Cancelación'}
        </Button>
      </Box>
    </Box>
  );
};

export default CancelSaleForm;