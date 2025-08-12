import React, { useState } from 'react';
import { TextField, InputAdornment, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../../api/posApi';

const ProductSearch = ({ onSearch, categoryId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isLoading, refetch } = useQuery({
    queryKey: ['searchProducts', searchTerm, categoryId],
    queryFn: () => searchProducts(searchTerm, categoryId),
    enabled: false,
    onSuccess: (data) => {
      onSearch(data);
    }
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2 || value.length === 0) {
      refetch();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      refetch();
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar productos por nombre, SKU o código de barras..."
        value={searchTerm}
        onChange={handleSearch}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLoading && <CircularProgress size={20} />}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default ProductSearch;