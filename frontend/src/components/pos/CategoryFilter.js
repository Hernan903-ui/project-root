import React from 'react';
import { useQuery } from 'react-query';
import { Box, Tabs, Tab, Skeleton } from '@mui/material';
import { getCategories } from '../../api/posApi';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const { data: categories, isLoading } = useQuery('categories', getCategories);

  if (isLoading) {
    return (
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="rectangular" height={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={selectedCategory || 0}
        onChange={(_, newValue) => onCategoryChange(newValue === 0 ? null : newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Todos" value={0} />
        {categories?.map((category) => (
          <Tab key={category.id} label={category.name} value={category.id} />
        ))}
      </Tabs>
    </Box>
  );
};

export default CategoryFilter;