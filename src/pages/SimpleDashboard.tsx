import React, { useState } from 'react'
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material'

const SimpleDashboard = () => {
  const [kpiData] = useState({
    totalProducts: 1234,
    lowStockItems: 23,
    totalValue: 45678,
    monthlyGrowth: 12.5,
  })

  const kpiCards = [
    {
      title: 'Total Products',
      value: kpiData.totalProducts,
      icon: <InventoryIcon />,
      color: 'primary' as const,
    },
    {
      title: 'Low Stock Items',
      value: kpiData.lowStockItems,
      icon: <WarningIcon />,
      color: 'warning' as const,
    },
    {
      title: 'Total Value',
      value: `$${kpiData.totalValue.toLocaleString()}`,
      icon: <AttachMoneyIcon />,
      color: 'success' as const,
    },
    {
      title: 'Monthly Growth',
      value: `${kpiData.monthlyGrowth}%`,
      icon: <TrendingUpIcon />,
      color: 'secondary' as const,
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your inventory management dashboard
      </Typography>

      <Grid container spacing={3}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: `${kpi.color}.main`,
                  color: 'white',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {kpi.icon}
              </Box>
              <Typography variant="h6" component="div" gutterBottom>
                {kpi.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {kpi.title}
              </Typography>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              📊 Charts and Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interactive charts and activity feeds will be implemented here
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              View Detailed Analytics
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SimpleDashboard