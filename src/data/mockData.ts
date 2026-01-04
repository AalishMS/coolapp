import { Product } from '../types/product'
import { StockTransaction, StockLevel } from '../types/stock'

// Mock products data
export const mockProducts: Product[] = [
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
]

// Mock stock transactions
export const mockStockTransactions: StockTransaction[] = [
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
]

// Mock stock levels
export const mockStockLevels: StockLevel[] = [
  {
    productId: '1',
    productName: 'Laptop Pro 15"',
    currentQuantity: 25,
    minStock: 10,
    maxStock: 50,
    status: 'normal',
    lastUpdated: new Date('2024-01-02'),
  },
  {
    productId: '2',
    productName: 'Wireless Mouse',
    currentQuantity: 150,
    minStock: 50,
    maxStock: 200,
    status: 'normal',
    lastUpdated: new Date('2024-01-03'),
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
]

// Dashboard KPI data
export const dashboardKPIs = {
  totalProducts: mockProducts.length,
  lowStockItems: mockStockLevels.filter(item => item.status === 'low' || item.status === 'critical').length,
  totalValue: mockProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0),
  monthlyGrowth: 12.5,
}