export interface StockTransaction {
  id: string
  productId: string
  type: 'stock-in' | 'stock-out' | 'adjustment'
  quantity: number
  reference?: string
  notes?: string
  createdAt: Date
  createdBy: string
}

export interface StockLevel {
  productId: string
  productName: string
  currentQuantity: number
  minStock: number
  maxStock: number
  status: 'normal' | 'low' | 'critical' | 'overstock'
  lastUpdated: Date
}

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  createdAt: Date
  updatedAt: Date
}