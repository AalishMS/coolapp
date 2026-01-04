import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as EqualIcon,
} from '@mui/icons-material'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  trend?: {
    value: number
    period: string
  }
  onClick?: () => void
  loading?: boolean
}

const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onClick,
  loading = false,
}: KPICardProps) => {
  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUpIcon color="success" />
    if (trendValue < 0) return <TrendingDownIcon color="error" />
    return <EqualIcon color="action" />
  }

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'success.main'
    if (trendValue < 0) return 'error.main'
    return 'text.secondary'
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: onClick ? 4 : 2,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{
              backgroundColor: `${color}.main`,
              color: 'white',
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
          
          {trend && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {getTrendIcon(trend.value)}
              <Typography
                variant="caption"
                color={getTrendColor(trend.value)}
                fontWeight="bold"
              >
                {Math.abs(trend.value)}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
          {loading ? '...' : value}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            vs {trend.period}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default KPICard