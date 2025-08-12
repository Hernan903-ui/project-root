import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useSnackbar } from 'notistack';
import { useMutation } from '@tanstack/react-query';

import { getProductByBarcode } from '../../api/posApi';
import { addItem } from '../../features/pos/cartSlice';

const BarcodeScanner = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [barcode, setBarcode] = useState('');
  
  const { mutate, isLoading } = useMutation({    
    mutationFn: getProductByBarcode,
    onSuccess: (product) => {
      if (product) {
        dispatch(addItem({ product, quantity: 1 }));
        enqueueSnackbar(`"${product.name}" agregado al carrito`, { variant: 'success' });
        setBarcode('');
      } else {
        enqueueSnackbar('Producto no encontrado', { variant: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error scanning barcode:', error);
      enqueueSnackbar('Error al buscar el producto', { variant: 'error' });
    }
  });

  const handleBarcodeChange = (e) => {
    setBarcode(e.target.value);
  };

  const handleScan = () => {
    if (barcode.trim()) {
      mutate(barcode);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Escanear código de barras"
        value={barcode}
        onChange={handleBarcodeChange}
        onKeyPress={handleKeyPress}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <IconButton onClick={handleScan} edge="end">
                  <QrCodeScannerIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default BarcodeScanner;