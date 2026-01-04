import React from 'react'
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Container,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material'

interface ErrorStateProps {
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
  showHome?: boolean
  onHome?: () => void
  severity?: 'error' | 'warning' | 'info'
}

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  showRetry = true,
  onRetry,
  showHome = false,
  onHome,
  severity = 'error',
}: ErrorStateProps) => {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        textAlign="center"
        py={4}
      >
        <Alert 
          severity={severity} 
          sx={{ 
            mb: 3, 
            width: '100%',
            '& .MuiAlert-icon': {
              fontSize: 32,
            }
          }}
        >
          <AlertTitle variant="h6" component="div">
            {title}
          </AlertTitle>
          {message}
        </Alert>

        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          {showRetry && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              sx={{ minWidth: 120 }}
            >
              Try Again
            </Button>
          )}
          
          {showHome && (
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={onHome}
              sx={{ minWidth: 120 }}
            >
              Go Home
            </Button>
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3 }}
        >
          If this problem persists, please contact support.
        </Typography>
      </Box>
    </Container>
  )
}

export default ErrorState