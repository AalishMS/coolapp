import { useState, useEffect } from 'react'
import { Box, Grid, Typography, Paper } from '@mui/material'
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material'
import { KPICard, CustomChart, ActivityFeed } from '../../components/ui'
import { mockProducts } from '../../data/mockData'
import { format, subDays, startOfDay } from 'date-fns'

const Dashboard = () => {
  const [kpiData, setKpiData] = useState({
    totalProducts: mockProducts.length,
    lowStockItems: mockProducts.filter(p => p.quantity <= p.minStock).length,
    totalValue: mockProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0),
    monthlyGrowth: 12.5,
  })
  const [loading, setLoading] = useState(false)

  // Generate mock stock levels data for chart
  const generateStockData = () => {
    const categories = ['Electronics', 'Furniture', 'Office Supplies', 'Tools']
    return {
      labels: categories,
      datasets: [
        {
          label: 'Current Stock',
          data: categories.map(() => Math.floor(Math.random() * 100) + 20),
          backgroundColor: 'rgba(25, 118, 210, 0.5)',
          borderColor: 'rgba(25, 118, 210, 1)',
          borderWidth: 1,
        },
        {
          label: 'Minimum Stock',
          data: categories.map(() => Math.floor(Math.random() * 30) + 10),
          backgroundColor: 'rgba(211, 47, 47, 0.5)',
          borderColor: 'rgba(211, 47, 47, 1)',
          borderWidth: 1,
        },
      ],
    }
  }

  // Generate category distribution data
  const generateCategoryData = () => {
    const categoryCount = mockProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      labels: Object.keys(categoryCount),
      datasets: [
        {
          data: Object.values(categoryCount),
          backgroundColor: [
            'rgba(25, 118, 210, 0.8)',
            'rgba(220, 0, 78, 0.8)',
            'rgba(46, 125, 50, 0.8)',
            'rgba(237, 108, 2, 0.8)',
            'rgba(123, 31, 162, 0.8)',
          ],
          borderColor: [
            'rgba(25, 118, 210, 1)',
            'rgba(220, 0, 78, 1)',
            'rgba(46, 125, 50, 1)',
            'rgba(237, 108, 2, 1)',
            'rgba(123, 31, 162, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Generate stock trend data
  const generateTrendData = () => {
    const labels = []
    const stockData = []
    const valueData = []

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      labels.push(format(date, 'MMM dd'))
      stockData.push(Math.floor(Math.random() * 50) + 100)
      valueData.push(Math.floor(Math.random() * 10000) + 30000)
    }

    return {
      labels,
      datasets: [
        {
          label: 'Total Stock Items',
          data: stockData,
          borderColor: 'rgba(25, 118, 210, 1)',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Inventory Value ($)',
          data: valueData,
          borderColor: 'rgba(46, 125, 50, 1)',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    }
  }

  // Generate mock activities
  const generateActivities = () => {
    const activities = []
    const types = ['stock-in', 'stock-out', 'adjustment', 'product-updated']
    const products = mockProducts.slice(0, 5)

    for (let i = 0; i < 10; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const type = types[Math.floor(Math.random() * types.length)]
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)

      activities.push({
        id: `activity-${i}`,
        type,
        productName: product.name,
        quantity: Math.floor(Math.random() * 50) + 1,
        timestamp,
        user: ['John Doe', 'Jane Smith', 'Mike Johnson'][Math.floor(Math.random() * 3)],
        notes: type.startsWith('stock') ? `${type === 'stock-in' ? 'Purchase' : 'Sale'} order #${1000 + i}` : undefined,
      })
    }

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8)
  }

  const stockData = generateStockData()
  const categoryData = generateCategoryData()
  const trendData = generateTrendData()
  const activities = generateActivities()

  const kpiCards = [
    {
      title: 'Total Products',
      value: kpiData.totalProducts,
      icon: <InventoryIcon />,
      color: 'primary' as const,
      trend: { value: 8.2, period: 'last month' },
    },
    {
      title: 'Low Stock Items',
      value: kpiData.lowStockItems,
      icon: <WarningIcon />,
      color: 'warning' as const,
      trend: { value: -12.5, period: 'last month' },
    },
    {
      title: 'Total Value',
      value: `$${kpiData.totalValue.toLocaleString()}`,
      icon: <AttachMoneyIcon />,
      color: 'success' as const,
      trend: { value: 15.3, period: 'last month' },
    },
    {
      title: 'Monthly Growth',
      value: `${kpiData.monthlyGrowth}%`,
      icon: <TrendingUpIcon />,
      color: 'secondary' as const,
      trend: { value: 2.1, period: 'last week' },
    },
  ]

  const chartOptions = {
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      ...(trendData.datasets.length > 1 && {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          beginAtZero: true,
        },
      }),
    },
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your inventory management dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <CustomChart
              type="line"
              data={trendData}
              options={chartOptions}
              title="Stock Levels & Inventory Trend (7 Days)"
              height={320}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <CustomChart
              type="doughnut"
              data={categoryData}
              title="Products by Category"
              height={320}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <CustomChart
              type="bar"
              data={stockData}
              title="Current Stock Levels by Category"
              height={320}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityFeed activities={activities} title="Recent Activity" />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard