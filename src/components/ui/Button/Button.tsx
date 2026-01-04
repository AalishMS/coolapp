import { Button, ButtonProps } from '@mui/material'
import { forwardRef } from 'react'

interface CustomButtonProps extends ButtonProps {
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ children, loading = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 500,
          px: 3,
          py: 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: 2,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          ...props.sx,
        }}
      >
        {loading ? 'Loading...' : children}
      </Button>
    )
  }
)

CustomButton.displayName = 'CustomButton'

export default CustomButton