import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Add as AddIcon,
} from '@mui/icons-material'

const SimpleProducts = () => {
  const [products] = useState([
    {
      id: '1',
      name: 'Laptop Pro 15"',
      sku: 'LP-001',
      category: 'Electronics',
      price: 1299.99,
      quantity: 25,
      location: 'Warehouse A',
    },
    {
      id: '2',
      name: 'Wireless Mouse',
      sku: 'WM-002',
      category: 'Electronics',
      price: 29.99,
      quantity: 150,
      location: 'Warehouse B',
    },
  ])

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                <TableCell align="center">{product.quantity}</TableCell>
                <TableCell>{product.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default SimpleProducts