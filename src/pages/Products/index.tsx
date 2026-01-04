import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Toolbar,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Checkbox,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { CustomTable, CustomDialog, Button as CustomButton, LoadingState, ErrorState } from '../../components/ui'
import { ProductForm } from '../../components/features'
import { useProductStore } from '../../store'
import { Product, ProductFormData } from '../../types/product'

const columns = [
  { id: 'name', label: 'Product Name', minWidth: 170 },
  { id: 'sku', label: 'SKU', minWidth: 100 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'quantity', label: 'Stock', minWidth: 80, align: 'center' as const },
  { id: 'price', label: 'Price', minWidth: 100, align: 'right' as const, format: (value: any) => {
    const num = Number(value)
    return isNaN(num) ? '-' : `$${num.toFixed(2)}`
  }},
  { id: 'location', label: 'Location', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100, align: 'center' as const },
]

const categories = ['All', 'Electronics', 'Furniture', 'Office Supplies', 'Tools', 'Other']
const locations = ['All', 'Warehouse A', 'Warehouse B', 'Warehouse C', 'Storage Room 1', 'Storage Room 2']
const statuses = ['All', 'normal', 'low', 'critical', 'overstock']

const Products = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)

  const {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    searchProducts,
    filterProducts,
  } = useProductStore()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery) {
      const searchResults = searchProducts(searchQuery)
      if (!searchResults.some(p => p.id === product.id)) return false
    }

    // Category filter
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false

    // Location filter
    if (selectedLocation !== 'All' && product.location !== selectedLocation) return false

    // Status filter
    let productStatus: string = 'normal'
    if (product.quantity <= product.minStock * 0.5) {
      productStatus = 'critical'
    } else if (product.quantity <= product.minStock) {
      productStatus = 'low'
    } else if (product.quantity >= product.maxStock) {
      productStatus = 'overstock'
    }

    if (selectedStatus !== 'All' && productStatus !== selectedStatus) return false

    return true
  })

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleAddProduct = async (productData: ProductFormData) => {
    try {
      await addProduct(productData)
      setShowAddDialog(false)
    } catch (error) {
      // Error is handled in the store
    }
  }

  const handleEditProduct = async (productData: ProductFormData) => {
    if (!editingProduct) return
    
    try {
      await updateProduct(editingProduct.id, productData)
      setShowEditDialog(false)
      setEditingProduct(null)
    } catch (error) {
      // Error is handled in the store
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(product.id)
      } catch (error) {
        // Error is handled in the store
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await bulkDeleteProducts(selectedProducts)
        setSelectedProducts([])
      } catch (error) {
        // Error is handled in the store
      }
    }
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = paginatedProducts.map(product => product.id)
      setSelectedProducts(newSelected)
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleExport = () => {
    // Simple CSV export
    const csvContent = [
      ['Name', 'SKU', 'Category', 'Quantity', 'Price', 'Location'].join(','),
      ...filteredProducts.map(product =>
        [product.name, product.sku, product.category, product.quantity, product.price, product.location]
          .map(field => `"${field}"`)
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    
    handleMenuClose()
  }

  const handleRefresh = () => {
    fetchProducts()
    handleMenuClose()
  }

  const isSelectedAll = paginatedProducts.length > 0 && paginatedProducts.every(product => selectedProducts.includes(product.id))
  const isIndeterminate = selectedProducts.length > 0 && !isSelectedAll

  if (error) {
    return <ErrorState message={error} onRetry={fetchProducts} />
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Product
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Toolbar>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select
                  value={selectedLocation}
                  label="Location"
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locations.map(location => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map(status => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box display="flex" gap={1}>
                {selectedProducts.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleBulkDelete}
                  >
                    Delete ({selectedProducts.length})
                  </Button>
                )}
                
                <IconButton onClick={handleMenuOpen}>
                  <MoreIcon />
                </IconButton>
                
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuList>
                    <MenuItemComponent onClick={handleRefresh}>
                      <ListItemIcon>
                        <RefreshIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Refresh</ListItemText>
                    </MenuItemComponent>
                    <MenuItemComponent onClick={handleExport}>
                      <ListItemIcon>
                        <ExportIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Export CSV</ListItemText>
                    </MenuItemComponent>
                  </MenuList>
                </Menu>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </Paper>

      <Paper>
        {loading && products.length === 0 ? (
          <LoadingState type="skeleton" height={400} count={5} />
        ) : (
          <CustomTable
            columns={[
              {
                id: 'select',
                label: '',
                minWidth: 50,
                align: 'center' as const,
                format: (value: any, row: any) => (
                  <Checkbox
                    checked={selectedProducts.includes(row.id)}
                    onChange={() => handleSelectProduct(row.id)}
                    color="primary"
                  />
                ),
              },
              ...columns,
            ]}
            rows={paginatedProducts}
            page={page}
            rowsPerPage={rowsPerPage}
            total={filteredProducts.length}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            onEdit={(product) => {
              setEditingProduct(product)
              setShowEditDialog(true)
            }}
            onDelete={handleDeleteProduct}
            emptyMessage="No products found"
          />
        )}
      </Paper>

      {/* Add Product Dialog */}
      <CustomDialog
        open={showAddDialog}
        title="Add New Product"
        onClose={() => setShowAddDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddDialog(false)}
          loading={loading}
          mode="create"
        />
      </CustomDialog>

      {/* Edit Product Dialog */}
      <CustomDialog
        open={showEditDialog}
        title="Edit Product"
        onClose={() => {
          setShowEditDialog(false)
          setEditingProduct(null)
        }}
        maxWidth="lg"
        fullWidth
      >
        {editingProduct && (
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleEditProduct}
            onCancel={() => {
              setShowEditDialog(false)
              setEditingProduct(null)
            }}
            loading={loading}
            mode="edit"
          />
        )}
      </CustomDialog>
    </Box>
  )
}

export default Products