export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  category: string
  price: number
  cost: number
  quantity: number
  minStock: number
  maxStock: number
  location: string
  supplier?: string
  barcode?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductFormData {
  name: string
  sku: string
  description?: string
  category: string
  price: number
  cost: number
  quantity: number
  minStock: number
  maxStock: number
  location: string
  supplier?: string
  barcode?: string
  image?: string
}