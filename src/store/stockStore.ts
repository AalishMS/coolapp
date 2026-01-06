import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StockTransaction, StockLevel } from '@/types/stock'

interface StockStore {
  transactions: StockTransaction[]
  stockLevels: StockLevel[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchTransactions: () => Promise<void>
  fetchStockLevels: () => Promise<void>
  addTransaction: (transaction: Omit<StockTransaction, 'id' | 'createdAt'>) => Promise<void>
  updateStockLevel: (productId: string, quantity: number) => void
  getLowStockItems: () => StockLevel[]
  clearError: () => void
}

export const useStockStore = create<StockStore>()(
  devtools(
    persist(
      (set, get) => ({
        transactions: [],
        stockLevels: [],
        loading: false,
        error: null,

        fetchTransactions: async () => {
          set({ loading: true, error: null })
          try {
            await new Promise(resolve => setTimeout(resolve, 800))
            
            const mockTransactions: StockTransaction[] = [
              {
                id: '1',
                productId: '1',
                type: 'stock-in',
                quantity: 10,
                reference: 'PO-2024-001',
                notes: 'New stock from supplier',
                createdAt: new Date('2024-01-02'),
                createdBy: 'admin',
              },
              {
                id: '2',
                productId: '2',
                type: 'stock-out',
                quantity: 5,
                reference: 'SO-2024-001',
                notes: 'Customer order fulfillment',
                createdAt: new Date('2024-01-03'),
                createdBy: 'admin',
              },
              {
                id: '3',
                productId: '3',
                type: 'adjustment',
                quantity: -2,
                notes: 'Damaged items removed',
                createdAt: new Date('2024-01-04'),
                createdBy: 'admin',
              },
              {
                id: '4',
                productId: '1',
                type: 'stock-out',
                quantity: 3,
                reference: 'SO-2024-002',
                notes: 'Bulk order',
                createdAt: new Date('2024-01-05'),
                createdBy: 'admin',
              },
            ]

            set({ transactions: mockTransactions, loading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch transactions',
              loading: false 
            })
          }
        },

        fetchStockLevels: async () => {
          set({ loading: true, error: null })
          try {
            await new Promise(resolve => setTimeout(resolve, 600))
            
            const mockStockLevels: StockLevel[] = [
              {
                productId: '1',
                productName: 'Laptop Pro 15"',
                currentQuantity: 25,
                minStock: 10,
                maxStock: 50,
                status: 'normal',
                lastUpdated: new Date('2024-01-05'),
              },
              {
                productId: '2',
                productName: 'Wireless Mouse',
                currentQuantity: 150,
                minStock: 50,
                maxStock: 200,
                status: 'normal',
                lastUpdated: new Date('2024-01-04'),
              },
              {
                productId: '3',
                productName: 'Office Chair',
                currentQuantity: 8,
                minStock: 15,
                maxStock: 30,
                status: 'low',
                lastUpdated: new Date('2024-01-04'),
              },
              {
                productId: '4',
                productName: 'Standing Desk',
                currentQuantity: 12,
                minStock: 5,
                maxStock: 25,
                status: 'normal',
                lastUpdated: new Date('2024-01-05'),
              },
              {
                productId: '5',
                productName: 'Notebook Set',
                currentQuantity: 85,
                minStock: 25,
                maxStock: 150,
                status: 'normal',
                lastUpdated: new Date('2024-01-06'),
              },
            ]

            set({ stockLevels: mockStockLevels, loading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch stock levels',
              loading: false 
            })
          }
        },

        addTransaction: async (transaction: Omit<StockTransaction, 'id' | 'createdAt'>) => {
          set({ loading: true, error: null })
          try {
            await new Promise(resolve => setTimeout(resolve, 300))

            const newTransaction: StockTransaction = {
              id: Date.now().toString(),
              ...transaction,
              createdAt: new Date(),
            }

            set(state => ({
              transactions: [newTransaction, ...state.transactions],
              loading: false
            }))

            // Update stock level
            const { updateStockLevel } = get()
            const quantityChange = transaction.type === 'stock-out' 
              ? -transaction.quantity 
              : transaction.type === 'stock-in' 
              ? transaction.quantity 
              : transaction.quantity

            updateStockLevel(transaction.productId, quantityChange)
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to add transaction',
              loading: false 
            })
          }
        },

        updateStockLevel: (productId: string, quantityChange: number) => {
          set(state => ({
            stockLevels: state.stockLevels.map(level =>
              level.productId === productId
                ? {
                    ...level,
                    currentQuantity: Math.max(0, level.currentQuantity + quantityChange),
                    lastUpdated: new Date(),
                    status: (() => {
                      const newQuantity = Math.max(0, level.currentQuantity + quantityChange)
                      if (newQuantity <= level.minStock * 0.5) return 'critical'
                      if (newQuantity <= level.minStock) return 'low'
                      if (newQuantity >= level.maxStock) return 'overstock'
                      return 'normal'
                    })()
                  }
                : level
            )
          }))
        },

        getLowStockItems: () => {
          const { stockLevels } = get()
          return stockLevels.filter(level => 
            level.status === 'low' || level.status === 'critical'
          )
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'stock-store',
      }
    )
  )
)