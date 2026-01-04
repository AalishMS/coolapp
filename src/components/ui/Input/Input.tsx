import { TextField, TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'

interface CustomInputProps extends Omit<TextFieldProps, 'variant'> {
  label: string
  error?: boolean
  helperText?: string
  required?: boolean
  fullWidth?: boolean
  size?: 'small' | 'medium'
}

const CustomInput = forwardRef<HTMLDivElement, CustomInputProps>(
  ({ error, helperText, required, fullWidth = true, size = 'medium', ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant="outlined"
        error={error}
        helperText={error ? helperText : helperText}
        required={required}
        fullWidth={fullWidth}
        size={size}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            '&.Mui-focused': {
              color: 'primary.main',
            },
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            mt: 0.5,
          },
        }}
        {...props}
      />
    )
  }
)

CustomInput.displayName = 'CustomInput'

export default CustomInput