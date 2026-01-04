import React from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material'

import { format } from 'date-fns'
import { 
  Inventory as InventoryIcon,
  LocalShipping as StockInIcon,
  ShoppingCart as StockOutIcon,
  Edit as AdjustIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material'

interface ActivityItem {
  id: string
  type: 'stock-in' | 'stock-out' | 'adjustment' | 'product-added' | 'product-updated'
  productName: string
  quantity: number
  timestamp: Date
  user: string
  notes?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  title?: string
  maxHeight?: number
  showMore?: boolean
  onLoadMore?: () => void
}

const ActivityFeed = ({
  activities,
  title = 'Recent Activity',
  maxHeight = 400,
  showMore = false,
  onLoadMore,
}: ActivityFeedProps) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconProps = { fontSize: 'small' as const }
    switch (type) {
      case 'stock-in':
        return <StockInIcon {...iconProps} color="success" />
      case 'stock-out':
        return <StockOutIcon {...iconProps} color="error" />
      case 'adjustment':
        return <AdjustIcon {...iconProps} color="warning" />
      case 'product-added':
        return <InventoryIcon {...iconProps} color="primary" />
      case 'product-updated':
        return <InventoryIcon {...iconProps} color="info" />
      default:
        return <InventoryIcon {...iconProps} />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'stock-in':
        return 'success'
      case 'stock-out':
        return 'error'
      case 'adjustment':
        return 'warning'
      case 'product-added':
        return 'primary'
      case 'product-updated':
        return 'info'
      default:
        return 'default'
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'stock-in':
        return `Stock in: +${activity.quantity} units`
      case 'stock-out':
        return `Stock out: -${activity.quantity} units`
      case 'adjustment':
        return `Stock adjustment: ${activity.quantity > 0 ? '+' : ''}${activity.quantity} units`
      case 'product-added':
        return 'New product added'
      case 'product-updated':
        return 'Product updated'
      default:
        return 'Activity recorded'
    }
  }

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <List sx={{ py: 0, maxHeight, overflow: 'auto' }}>
          {activities.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No recent activity
              </Typography>
            </Box>
          ) : (
            activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: 'background.paper' }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {activity.productName}
                        </Typography>
                        <Chip
                          label={getActivityText(activity)}
                          size="small"
                          color={getActivityColor(activity.type) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {activity.user} • {formatRelativeTime(activity.timestamp)}
                        </Typography>
                        {activity.notes && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {activity.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <IconButton size="small">
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </ListItem>
                {index < activities.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))
          )}
        </List>
      </Box>

      {showMore && onLoadMore && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer', textAlign: 'center' }}
            onClick={onLoadMore}
          >
            Load more activities
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default ActivityFeed