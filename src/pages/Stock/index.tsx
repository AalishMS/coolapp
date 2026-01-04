import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  LinearProgress,
  Fab,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { CustomDialog, Button as CustomButton, Input as CustomInput } from '../../components/ui'
import { useStockStore, useProductStore } from '../../store'
import { StockTransaction, StockLevel } from '../../types/stock'
import { Product } from '../../types/product'
import { format } from 'date-fns'

const Stock = () => {
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [transactionType, setTransactionType] = useState<'stock-in' | 'stock-out' | 'adjustment'>('stock-in')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  const {
    transactions,
    stockLevels,
    loading,
    error,
    fetchTransactions,
    fetchStockLevels,
    addTransaction,
    getLowStockItems,
  } = useStockStore()

  const { products } = useProductStore()

  useEffect(() => {
    fetchTransactions()
    fetchStockLevels()
  }, [fetchTransactions, fetchStockLevels])

  const lowStockItems = getLowStockItems()
  const criticalItems = lowStockItems.filter(item => item.status === 'critical')

  const handleAddTransaction = async () => {
    if (!selectedProduct || quantity <= 0) return

    try {
      await addTransaction({
        productId: selectedProduct,
        type: transactionType,
        quantity,
        reference: reference || undefined,
        notes: notes || undefined,
        createdBy: 'Current User',
      })

      // Reset form
      setSelectedProduct('')
      setQuantity(1)
      setReference('')
      setNotes('')
      setShowTransactionDialog(false)
    } catch (error) {
      // Error is handled in the store
    }
  }

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const getStockColor = (level: StockLevel) => {
    switch (level.status) {
      case 'critical':
        return 'error'
      case 'low':
        return 'warning'
      case 'overstock':
        return 'info'
      default:
        return 'success'
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'stock-in':
        return 'success'
      case 'stock-out':
        return 'error'
      case 'adjustment':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Stock Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowTransactionDialog(true)}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Alerts Section */}
      {criticalItems.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Critical Stock Alert!</AlertTitle>
          {criticalItems.length} item(s) are critically low on stock and need immediate attention.
        </Alert>
      )}

      {lowStockItems.length > criticalItems.length && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Low Stock Warning</AlertTitle>
          {lowStockItems.length - criticalItems.length} item(s) are running low on stock.
        </Alert>
      )}

      {/* Stock Levels Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Stock Status Overview
            </Typography>
            <Grid container spacing={2}>
              {stockLevels.map((level) => (
                <Grid item xs={12} sm={6} key={level.productId}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: 2,
                      borderColor: `${getStockColor(level)}.main`,
                      backgroundColor: `${getStockColor(level)}.light`,
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      {level.productName}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body1" fontWeight="medium">
                        {level.currentQuantity} units
                      </Typography>
                      <Chip
                        label={level.status}
                        color={getStockColor(level) as any}
                        size="small"
                      />
                    </Box>
                    <Box mb={1}>
                      <Typography variant="caption" color="text.secondary">
                        Min: {level.minStock} | Max: {level.maxStock}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getStockPercentage(level.currentQuantity, level.maxStock)}
                      color={getStockColor(level) as any}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Last updated: {format(level.lastUpdated, 'MMM dd, HH:mm')}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Transactions</Typography>
              <IconButton onClick={() => fetchTransactions()} size="small">
                <RefreshIcon />
              </IconButton>
            </Box>
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => {
                    const product = products.find(p => p.id === transaction.productId)
                    return (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          <Chip
                            label={transaction.type.replace('-', ' ')}
                            color={getTransactionTypeColor(transaction.type) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {product?.name || 'Unknown Product'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={
                              transaction.type === 'stock-out' ? 'error.main' :
                              transaction.type === 'stock-in' ? 'success.main' :
                              'text.primary'
                            }
                            fontWeight="bold"
                          >
                            {transaction.type === 'stock-out' ? '-' : 
                             transaction.type === 'stock-in' ? '+' : ''}
                            {transaction.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {format(transaction.createdAt, 'MMM dd, HH:mm')}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No transactions yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction Dialog */}
      <CustomDialog
        open={showTransactionDialog}
        title="Add Stock Transaction"
        onClose={() => setShowTransactionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddTransaction(); }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select the type of transaction you want to record.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <CustomInput
                select
                label="Transaction Type"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="stock-in">Stock In (Purchase/Return)</MenuItem>
                <MenuItem value="stock-out">Stock Out (Sale/Damage)</MenuItem>
                <MenuItem value="adjustment">Stock Adjustment</MenuItem>
              </CustomInput>
            </Grid>

            <Grid item xs={12}>
              <CustomInput
                select
                label="Product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                fullWidth
                required
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} (Current: {product.quantity})
                  </MenuItem>
                ))}
              </CustomInput>
            </Grid>

            <Grid item xs={12}>
              <CustomInput
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomInput
                label="Reference (Optional)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                fullWidth
                placeholder="PO-2024-001, SO-2024-001, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <CustomInput
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <CustomButton
                  variant="outlined"
                  onClick={() => setShowTransactionDialog(false)}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="contained"
                  onClick={handleAddTransaction}
                  loading={loading}
                  disabled={!selectedProduct || quantity <= 0}
                >
                  Add Transaction
                </CustomButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CustomDialog>

      {/* Floating Action Button for quick stock in */}
      <Fab
        color="primary"
        aria-label="add stock"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => {
          setTransactionType('stock-in')
          setShowTransactionDialog(true)
        }}
      >
        <TrendingUpIcon />
      </Fab>
    </Box>
  )
}

export default Stock