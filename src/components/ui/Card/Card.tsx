import { Card, CardProps } from '@mui/material'
import { forwardRef } from 'react'

interface CustomCardProps extends CardProps {
  elevation?: number
  hover?: boolean
  padding?: number
  children: React.ReactNode
}

const CustomCard = forwardRef<HTMLDivElement, CustomCardProps>(
  ({ elevation = 2, hover = true, padding = 3, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        elevation={elevation}
        sx={{
          borderRadius: 3,
          padding,
          transition: 'all 0.2s ease-in-out',
          ...(hover && {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }),
          ...props.sx,
        }}
        {...props}
      >
        {children}
      </Card>
    )
  }
)

CustomCard.displayName = 'CustomCard'

export default CustomCard