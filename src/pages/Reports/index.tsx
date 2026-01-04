import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  AlertTitle,
} from '@mui/material'
import {
  Download as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { CustomChart, CustomTable, LoadingState } from '../../components/ui'
import { useProductStore, useStockStore } from '../../store'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ReportFilters {
  reportType: 'inventory' | 'transactions' | 'low-stock' | 'valuation' | 'sales'
  dateRange: '7days' | '30days' | '90days' | 'custom'
  startDate: Date | null
  endDate: Date | null
  category: string
  location: string
}

const Reports = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'inventory',
    dateRange: '30days',
    startDate: null,
    endDate: null,
    category: 'all',
    location: 'all',
  })
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { products } = useProductStore()
  const { transactions, stockLevels } = useStockStore()

  const categories = ['all', 'Electronics', 'Furniture', 'Office Supplies', 'Tools', 'Other']
  const locations = ['all', 'Warehouse A', 'Warehouse B', 'Warehouse C', 'Storage Room 1', 'Storage Room 2']

  useEffect(() => {
    generateReport()
  }, [filters, products, transactions, stockLevels])

  const getDateRange = () => {
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (filters.dateRange) {
      case '7days':
        startDate = subDays(now, 7)
        break
      case '30days':
        startDate = subDays(now, 30)
        break
      case '90days':
        startDate = subDays(now, 90)
        break
      case 'custom':
        startDate = filters.startDate || subDays(now, 30)
        endDate = filters.endDate || now
        break
      default:
        startDate = subDays(now, 30)
    }

    return { startDate: startOfDay(startDate), endDate: endOfDay(endDate) }
  }

  const generateReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const { startDate, endDate } = getDateRange()
      
      let filteredProducts = products.filter(product => {
        // Category filter
        if (filters.category !== 'all' && product.category !== filters.category) return false
        // Location filter
        if (filters.location !== 'all' && product.location !== filters.location) return false
        return true
      })

      let filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt)
        return transactionDate >= startDate && transactionDate <= endDate
      })

      let data: any = {}

      switch (filters.reportType) {
        case 'inventory':
          data = {
            type: 'Inventory Report',
            summary: {
              totalProducts: filteredProducts.length,
              totalValue: filteredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0),
              totalCost: filteredProducts.reduce((sum, p) => sum + (p.cost * p.quantity), 0),
              lowStockItems: filteredProducts.filter(p => p.quantity <= p.minStock).length,
            },
            details: filteredProducts.map(p => ({
              ...p,
              value: p.price * p.quantity,
              cost: p.cost * p.quantity,
              profit: (p.price - p.cost) * p.quantity,
            })),
            chartData: {
              labels: filteredProducts.map(p => p.name),
              datasets: [{
                label: 'Stock Quantity',
                data: filteredProducts.map(p => p.quantity),
                backgroundColor: 'rgba(25, 118, 210, 0.8)',
              }],
            },
          }
          break

        case 'transactions':
          data = {
            type: 'Transaction Report',
            summary: {
              totalTransactions: filteredTransactions.length,
              stockIn: filteredTransactions.filter(t => t.type === 'stock-in').reduce((sum, t) => sum + t.quantity, 0),
              stockOut: filteredTransactions.filter(t => t.type === 'stock-out').reduce((sum, t) => sum + t.quantity, 0),
              adjustments: filteredTransactions.filter(t => t.type === 'adjustment').length,
            },
            details: filteredTransactions.map(t => {
              const product = products.find(p => p.id === t.productId)
              return {
                ...t,
                productName: product?.name || 'Unknown',
                date: format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm'),
              }
            }),
            chartData: {
              labels: ['Stock In', 'Stock Out', 'Adjustments'],
              datasets: [{
                data: [
                  filteredTransactions.filter(t => t.type === 'stock-in').reduce((sum, t) => sum + t.quantity, 0),
                  filteredTransactions.filter(t => t.type === 'stock-out').reduce((sum, t) => sum + t.quantity, 0),
                  filteredTransactions.filter(t => t.type === 'adjustment').length,
                ],
                backgroundColor: ['rgba(46, 125, 50, 0.8)', 'rgba(211, 47, 47, 0.8)', 'rgba(237, 108, 2, 0.8)'],
              }],
            },
          }
          break

        case 'low-stock':
          const lowStockProducts = filteredProducts.filter(p => p.quantity <= p.minStock)
          data = {
            type: 'Low Stock Report',
            summary: {
              totalLowStock: lowStockProducts.length,
              criticalItems: lowStockProducts.filter(p => p.quantity <= p.minStock * 0.5).length,
              totalValueAtRisk: lowStockProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0),
            },
            details: lowStockProducts.map(p => ({
              ...p,
              reorderQuantity: p.maxStock - p.quantity,
              reorderCost: (p.maxStock - p.quantity) * p.cost,
            })),
            chartData: {
              labels: lowStockProducts.map(p => p.name),
              datasets: [{
                label: 'Current Stock',
                data: lowStockProducts.map(p => p.quantity),
                backgroundColor: 'rgba(211, 47, 47, 0.8)',
              }],
            },
          }
          break

        case 'valuation':
          data = {
            type: 'Inventory Valuation Report',
            summary: {
              totalMarketValue: filteredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0),
              totalCostValue: filteredProducts.reduce((sum, p) => sum + (p.cost * p.quantity), 0),
              totalProfit: filteredProducts.reduce((sum, p) => sum + ((p.price - p.cost) * p.quantity), 0),
              averageMargin: filteredProducts.length > 0 
                ? (filteredProducts.reduce((sum, p) => sum + ((p.price - p.cost) / p.cost * 100), 0) / filteredProducts.length)
                : 0,
            },
            details: filteredProducts.map(p => ({
              ...p,
              marketValue: p.price * p.quantity,
              costValue: p.cost * p.quantity,
              profit: (p.price - p.cost) * p.quantity,
              margin: ((p.price - p.cost) / p.cost * 100).toFixed(2),
            })),
            chartData: {
              labels: filteredProducts.map(p => p.name),
              datasets: [
                {
                  label: 'Market Value',
                  data: filteredProducts.map(p => p.price * p.quantity),
                  backgroundColor: 'rgba(25, 118, 210, 0.8)',
                },
                {
                  label: 'Cost Value',
                  data: filteredProducts.map(p => p.cost * p.quantity),
                  backgroundColor: 'rgba(220, 0, 78, 0.8)',
                },
              ],
            },
          }
          break

        case 'sales':
          // Mock sales data for demonstration
          const mockSales = filteredProducts.map(p => ({
            productName: p.name,
            quantitySold: Math.floor(Math.random() * 50),
            revenue: p.price * Math.floor(Math.random() * 50),
            profit: (p.price - p.cost) * Math.floor(Math.random() * 50),
          }))
          data = {
            type: 'Sales Report',
            summary: {
              totalSales: mockSales.reduce((sum, s) => sum + s.revenue, 0),
              totalProfit: mockSales.reduce((sum, s) => sum + s.profit, 0),
              unitsSold: mockSales.reduce((sum, s) => sum + s.quantitySold, 0),
              averageOrder: mockSales.length > 0 ? mockSales.reduce((sum, s) => sum + s.revenue, 0) / mockSales.length : 0,
            },
            details: mockSales,
            chartData: {
              labels: mockSales.map(s => s.productName),
              datasets: [
                {
                  label: 'Revenue',
                  data: mockSales.map(s => s.revenue),
                  backgroundColor: 'rgba(46, 125, 50, 0.8)',
                },
                {
                  label: 'Profit',
                  data: mockSales.map(s => s.profit),
                  backgroundColor: 'rgba(25, 118, 210, 0.8)',
                },
              ],
            },
          }
          break

        default:
          data = { type: 'Unknown Report', summary: {}, details: [], chartData: {} }
      }

      setReportData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData?.details) return

    const headers = Object.keys(reportData.details[0] || {})
    const csvContent = [
      headers.join(','),
      ...reportData.details.map((row: any) =>
        headers.map(header => `"${row[header] || ''}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportData.type.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = async () => {
    if (!reportData) return

    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(18)
    pdf.text(reportData.type, 20, 20)
    
    // Add summary
    pdf.setFontSize(12)
    let yPosition = 40
    Object.entries(reportData.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      pdf.text(`${label}: ${value}`, 20, yPosition)
      yPosition += 10
    })

    // Add chart (if we have a chart element)
    const chartElement = document.getElementById('report-chart')
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement)
        const imgData = canvas.toDataURL('image/png')
        pdf.addPage()
        pdf.text('Chart', 20, 20)
        pdf.addImage(imgData, 'PNG', 20, 30, 170, 100)
      } catch (error) {
        console.error('Failed to capture chart:', error)
      }
    }

    pdf.save(`${reportData.type.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  const handleFilterChange = (field: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Generate and export comprehensive inventory reports
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Filters
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={filters.reportType}
                label="Report Type"
                onChange={(e) => handleFilterChange('reportType', e.target.value)}
              >
                <MenuItem value="inventory">Inventory Report</MenuItem>
                <MenuItem value="transactions">Transaction Report</MenuItem>
                <MenuItem value="low-stock">Low Stock Report</MenuItem>
                <MenuItem value="valuation">Inventory Valuation</MenuItem>
                <MenuItem value="sales">Sales Report</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                label="Date Range"
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.location}
                label="Location"
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                {locations.map(loc => (
                  <MenuItem key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={generateReport}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<CsvIcon />}
                onClick={exportToCSV}
                disabled={!reportData}
              >
                CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={exportToPDF}
                disabled={!reportData}
              >
                PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingState type="skeleton" height={400} />
      ) : reportData ? (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {reportData.type} - Summary
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={3} key={key}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {typeof value === 'number' && key.toLowerCase().includes('value')
                          ? formatCurrency(value as number)
                          : value as string | number
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Chart */}
          {reportData.chartData && (
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: 400 }}>
                <div id="report-chart">
                  <CustomChart
                    type={filters.reportType === 'valuation' || filters.reportType === 'sales' ? 'bar' : 'bar'}
                    data={reportData.chartData}
                    title={`${reportData.type} Chart`}
                    height={320}
                  />
                </div>
              </Paper>
            </Grid>
          )}

          {/* Details Table */}
          <Grid item xs={12} md={reportData.chartData ? 12 : 12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Breakdown
              </Typography>
              {reportData.details && reportData.details.length > 0 ? (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {Object.keys(reportData.details[0]).map((header) => (
                          <TableCell key={header}>
                            {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.details.slice(0, 50).map((row: any, index: number) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {typeof value === 'number' && (
                                (cellIndex.toString().toLowerCase().includes('value') ||
                                 cellIndex.toString().toLowerCase().includes('price') ||
                                 cellIndex.toString().toLowerCase().includes('cost') ||
                                 cellIndex.toString().toLowerCase().includes('revenue') ||
                                 cellIndex.toString().toLowerCase().includes('profit'))
                              )
                                ? formatCurrency(value)
                                : String(value ?? '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No data available for this report
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            Select report filters and generate a report to view results
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default Reports