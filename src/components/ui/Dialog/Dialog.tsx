import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

interface CustomDialogProps {
  open: boolean
  title: string
  children: React.ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  showCloseButton?: boolean
  onClose: () => void
  actions?: React.ReactNode
}

const CustomDialog = ({
  open,
  title,
  children,
  maxWidth = 'md',
  fullWidth = true,
  showCloseButton = true,
  onClose,
  actions,
}: CustomDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 4,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default CustomDialog