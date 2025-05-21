import React, { useState, useCallback } from 'react';
import { Box, Paper, Divider, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../api/posApi';
import GridItem from '../components/common/GridItem'; // Importamos el componente GridItem personalizado

import ProductSearch from '../components/pos/ProductSearch';
import CategoryFilter from '../components/pos/CategoryFilter';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import BarcodeScanner from '../components/pos/BarcodeScanner';

const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Actualizado a @tanstack/react-query
  const { isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, searchTerm],
    queryFn: () => searchProducts(searchTerm, selectedCategory),
    onSuccess: (data) => {
      setProducts(data);
    },
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minuto antes de considerar los datos obsoletos
  });

  // Optimizado con useCallback
  const handleSearch = useCallback((searchResults, term) => {
    setProducts(searchResults);
    setSearchTerm(term);
  }, []);

  // Optimizado con useCallback
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  return (
    <Box sx={{ 
      height: { 
        xs: 'auto', 
        md: 'calc(100vh - 64px)' 
      },
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Sección izquierda: Búsqueda y productos */}
        <GridItem xs={12} md={8} lg={9} sx={{ 
          height: { xs: 'auto', md: '100%' }, 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 2, 
              mb: 2,
              borderRadius: 2
            }}
          >
            <BarcodeScanner />
            <Divider sx={{ my: 2 }} />
            <ProductSearch 
              onSearch={handleSearch} 
              categoryId={selectedCategory} 
              initialValue={searchTerm}
            />
            <CategoryFilter 
              selectedCategory={selectedCategory} 
              onCategoryChange={handleCategoryChange} 
            />
          </Paper>
          
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            pb: 2,
            minHeight: { xs: 400, md: 0 }, // Altura mínima en móviles
            maxHeight: { xs: 'none', md: 'calc(100vh - 230px)' } // Altura máxima en escritorio
          }}>
            <ProductGrid 
              products={products} 
              isLoading={isLoading} 
              error={error} 
            />
          </Box>
        </GridItem>
        
        {/* Sección derecha: Carrito */}
        <GridItem xs={12} md={4} lg={3} sx={{ 
          height: { xs: 'auto', md: '100%' }, 
          display: 'flex'
        }}>
          <Cart />
        </GridItem>
      </Grid>
    </Box>
  );
};

export default POSPage;