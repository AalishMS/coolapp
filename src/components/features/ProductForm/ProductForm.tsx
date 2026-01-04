import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  Grid,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Button as CustomButton, Input as CustomInput } from '../../../components/ui'

interface FormData {
  name: string
  sku: string
  description: string
  category: string
  price: number
  cost: number
  quantity: number
  minStock: number
  maxStock: number
  location: string
  supplier: string
}

interface ProductFormProps {
  initialData?: Partial<FormData>
  onSubmit: (data: FormData) => void
  onCancel: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
}

const categories = [
  'Electronics',
  'Furniture',
  'Office Supplies',
  'Raw Materials',
  'Tools',
  'Other',
]

const suppliers = [
  'Tech Suppliers Inc.',
  'Accessory Corp',
  'Furniture Plus',
  'Office Depot',
  'Global Imports',
]

const locations = [
  'Warehouse A',
  'Warehouse B',
  'Warehouse C',
  'Storage Room 1',
  'Storage Room 2',
]

const ProductForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
}: ProductFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      category: '',
      price: 0,
      cost: 0,
      quantity: 0,
      minStock: 10,
      maxStock: 100,
      location: '',
      supplier: '',
      ...initialData,
    },
    mode: 'onChange',
  })

  const formValues = watch()
  const hasRequiredFields = formValues.name && formValues.sku && formValues.category && formValues.location && formValues.price > 0

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      price: Number(data.price),
      cost: Number(data.cost),
      quantity: Number(data.quantity),
      minStock: Number(data.minStock),
      maxStock: Number(data.maxStock),
    })
  }

  const hasErrors = Object.keys(errors).length > 0
  const isFormValid = !hasErrors && hasRequiredFields

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
      <Typography variant="h5" gutterBottom>
        {mode === 'create' ? 'Add New Product' : 'Edit Product'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Product name is required' }}
            render={({ field, fieldState }) => (
              <CustomInput
                {...field}
                label="Product Name"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="sku"
            control={control}
            rules={{ required: 'SKU is required' }}
            render={({ field, fieldState }) => (
              <CustomInput
                {...field}
                label="SKU"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <CustomInput
                {...field}
                label="Description"
                multiline
                rows={3}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>Category</InputLabel>
                <Select
                  {...field}
                  label="Category"
                  error={!!fieldState.error}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="location"
            control={control}
            rules={{ required: 'Location is required' }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>Location</InputLabel>
                <Select
                  {...field}
                  label="Location"
                  error={!!fieldState.error}
                >
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="price"
            control={control}
            rules={{
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' },
            }}
            render={({ field, fieldState }) => (
              <CustomInput
                {...field}
                label="Price ($)"
                type="number"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="cost"
            control={control}
            rules={{
              required: 'Cost is required',
              min: { value: 0, message: 'Cost must be positive' },
            }}
            render={({ field, fieldState }) => (
              <CustomInput
                {...field}
                label="Cost ($)"
                type="number"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="quantity"
            control={control}
            rules={{
              required: 'Quantity is required',
              min: { value: 0, message: 'Quantity must be positive' },
            }}
            render={({ field, fieldState }) => (
              <CustomInput
                {...field}
                label="Current Quantity"
                type="number"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
                inputProps={{ min: '0' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="minStock"
            control={control}
            rules={{
              required: 'Minimum stock is required',
              min: { value: 0, message: 'Minimum stock must be positive' },
            }}
            render={({ field, fieldState }) => (
              <CustomInput
                {...field}
                label="Minimum Stock"
                type="number"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
                inputProps={{ min: '0' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="maxStock"
            control={control}
            rules={{
              required: 'Maximum stock is required',
              min: { value: 1, message: 'Maximum stock must be positive' },
            }}
            render={({ field, fieldState }) => (
              <CustomInput
                {...field}
                label="Maximum Stock"
                type="number"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
                inputProps={{ min: '1' }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="supplier"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>Supplier</InputLabel>
                <Select
                  {...field}
                  label="Supplier"
                  error={!!fieldState.error}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier} value={supplier}>
                      {supplier}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
            <CustomButton
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              variant="contained"
              loading={loading}
              disabled={!isFormValid || loading}
            >
              {mode === 'create' ? 'Add Product' : 'Update Product'}
            </CustomButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProductForm