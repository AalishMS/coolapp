import React from 'react'
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Avatar,
  Card,
  CardContent,
} from '@mui/material'

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'card'
  message?: string
  height?: number | string
  count?: number
}

const LoadingState = ({ 
  type = 'spinner', 
  message = 'Loading...', 
  height = 200,
  count = 3 
}: LoadingStateProps) => {
  const renderSpinner = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height={height}
    >
      <CircularProgress size={40} thickness={4} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  )

  const renderSkeleton = () => (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={60} />
        </Box>
      ))}
    </Box>
  )

  const renderCardSkeleton = () => (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
      gap={3}
      sx={{ p: 3 }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ ml: 2, flex: 1 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>
            </Box>
            <Skeleton variant="rectangular" width="100%" height={120} />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="80%" height={16} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )

  switch (type) {
    case 'skeleton':
      return renderSkeleton()
    case 'card':
      return renderCardSkeleton()
    default:
      return renderSpinner()
  }
}

export default LoadingState