import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Product, ProductFormData } from '@/types/product'

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchProducts: () => Promise<void>
  addProduct: (productData: ProductFormData) => Promise<void>
  updateProduct: (id: string, productData: Partial<ProductFormData>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  bulkDeleteProducts: (ids: string[]) => Promise<void>
  searchProducts: (query: string) => Product[]
  filterProducts: (filters: ProductFilters) => Product[]
  getProductById: (id: string) => Product | undefined
  clearError: () => void
}

interface ProductFilters {
  category?: string
  status?: 'normal' | 'low' | 'critical' | 'overstock'
  minPrice?: number
  maxPrice?: number
  location?: string
}

export const useProductStore = create<ProductStore>()(
  devtools(
    persist(
      (set, get) => ({
        products: [],
        loading: false,
        error: null,

        fetchProducts: async () => {
          set({ loading: true, error: null })
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // In real app, this would be an API call
            // const response = await api.get('/products')
            
            // For now, return mock data
            const mockProducts: Product[] = [
              {
                id: '1',
                name: 'Laptop Pro 15"',
                sku: 'LP-001',
                description: 'High-performance laptop for professionals',
                category: 'Electronics',
                price: 1299.99,
                cost: 899.99,
                quantity: 25,
                minStock: 10,
                maxStock: 50,
                location: 'Warehouse A',
                supplier: 'Tech Suppliers Inc.',
                barcode: '1234567890123',
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-02'),
              },
              {
                id: '2',
                name: 'Wireless Mouse',
                sku: 'WM-002',
                description: 'Ergonomic wireless mouse',
                category: 'Electronics',
                price: 29.99,
                cost: 15.99,
                quantity: 150,
                minStock: 50,
                maxStock: 200,
                location: 'Warehouse B',
                supplier: 'Accessory Corp',
                barcode: '1234567890124',
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-03'),
              },
              {
                id: '3',
                name: 'Office Chair',
                sku: 'OC-003',
                description: 'Comfortable office chair with lumbar support',
                category: 'Furniture',
                price: 199.99,
                cost: 120.00,
                quantity: 8,
                minStock: 15,
                maxStock: 30,
                location: 'Warehouse C',
                supplier: 'Furniture Plus',
                barcode: '1234567890125',
                createdAt: new Date('2024-01-03'),
                updatedAt: new Date('2024-01-04'),
              },
              {
                id: '4',
                name: 'Standing Desk',
                sku: 'SD-004',
                description: 'Adjustable height standing desk',
                category: 'Furniture',
                price: 449.99,
                cost: 280.00,
                quantity: 12,
                minStock: 5,
                maxStock: 25,
                location: 'Warehouse A',
                supplier: 'Furniture Plus',
                barcode: '1234567890126',
                createdAt: new Date('2024-01-04'),
                updatedAt: new Date('2024-01-05'),
              },
              {
                id: '5',
                name: 'Notebook Set',
                sku: 'NS-005',
                description: 'Premium notebook and pen set',
                category: 'Office Supplies',
                price: 24.99,
                cost: 12.50,
                quantity: 85,
                minStock: 25,
                maxStock: 150,
                location: 'Warehouse B',
                supplier: 'Office Depot',
                barcode: '1234567890127',
                createdAt: new Date('2024-01-05'),
                updatedAt: new Date('2024-01-06'),
              },
            ]

            set({ products: mockProducts, loading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch products',
              loading: false 
            })
          }
        },

        addProduct: async (productData: ProductFormData) => {
          set({ loading: true, error: null })
          try {
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const newProduct: Product = {
              id: Date.now().toString(),
              ...productData,
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            set(state => ({
              products: [...state.products, newProduct],
              loading: false
            }))
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to add product',
              loading: false 
            })
          }
        },

        updateProduct: async (id: string, productData: Partial<ProductFormData>) => {
          set({ loading: true, error: null })
          try {
            await new Promise(resolve => setTimeout(resolve, 500))
            
            set(state => ({
              products: state.products.map(product =>
                product.id === id
                  ? { ...product, ...productData, updatedAt: new Date() }
                  : product
              ),
              loading: false
            }))
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update product',
              loading: false 
            })
          }
        },

        deleteProduct: async (id: string) => {
          set({ loading: true, error: null })
          try {
            await new Promise(resolve => setTimeout(resolve, 300))
            
            set(state => ({
              products: state.products.filter(product => product.id !== id),
              loading: false
            }))
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to delete product',
              loading: false 
            })
          }
        },

        bulkDeleteProducts: async (ids: string[]) => {
          set({ loading: true, error: null })
          try {
            await new Promise(resolve => setTimeout(resolve, 500))
            
            set(state => ({
              products: state.products.filter(product => !ids.includes(product.id)),
              loading: false
            }))
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to delete products',
              loading: false 
            })
          }
        },

        searchProducts: (query: string) => {
          const { products } = get()
          if (!query.trim()) return products
          
          const lowercaseQuery = query.toLowerCase()
          return products.filter(product =>
            product.name.toLowerCase().includes(lowercaseQuery) ||
            product.sku.toLowerCase().includes(lowercaseQuery) ||
            product.description?.toLowerCase().includes(lowercaseQuery) ||
            product.category.toLowerCase().includes(lowercaseQuery)
          )
        },

        filterProducts: (filters: ProductFilters) => {
          const { products } = get()
          
          return products.filter(product => {
            if (filters.category && product.category !== filters.category) return false
            if (filters.location && product.location !== filters.location) return false
            
            // Calculate stock status
            let status: 'normal' | 'low' | 'critical' | 'overstock'
            if (product.quantity <= product.minStock * 0.5) {
              status = 'critical'
            } else if (product.quantity <= product.minStock) {
              status = 'low'
            } else if (product.quantity >= product.maxStock) {
              status = 'overstock'
            } else {
              status = 'normal'
            }
            
            if (filters.status && status !== filters.status) return false
            
            if (filters.minPrice && product.price < filters.minPrice) return false
            if (filters.maxPrice && product.price > filters.maxPrice) return false
            
            return true
          })
        },

        getProductById: (id: string) => {
          const { products } = get()
          return products.find(product => product.id === id)
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'product-store',
        partialize: (state) => ({ products: state.products }),
      }
    )
  )
)