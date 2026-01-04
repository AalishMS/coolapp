import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material'

interface Column {
  id: string
  label: string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  format?: (value: any, row?: any) => string | React.ReactNode
}

interface CustomTableProps {
  columns: Column[]
  rows: any[]
  page: number
  rowsPerPage: number
  total: number
  onPageChange: (newPage: number) => void
  onRowsPerPageChange: (newRowsPerPage: number) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
  loading?: boolean
  emptyMessage?: string
}

const CustomTable = ({
  columns,
  rows,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = 'No data available',
}: CustomTableProps) => {
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    onPageChange(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10))
    onPageChange(0)
  }

  const getStatusChip = (status: string) => {
    const colorMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      active: 'success',
      pending: 'warning',
      inactive: 'error',
      normal: 'info',
      low: 'warning',
      critical: 'error',
      overstock: 'info',
    }
    
    return (
      <Chip
        label={status}
        color={colorMap[status] || 'default'}
        size="small"
        variant="outlined"
      />
    )
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    backgroundColor: 'grey.50',
                    fontWeight: 'bold',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.main',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'grey.50',
                    fontWeight: 'bold',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.main',
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id || index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id]
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.format
                            ? column.id === 'status'
                              ? getStatusChip(value)
                              : column.format(value, row)
                            : value}
                        </TableCell>
                      )
                    })}
                    {(onEdit || onDelete || onView) && (
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          {onView && (
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => onView(row)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onEdit(row)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDelete(row)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '& .MuiTableToolbar-root': {
            pl: 2,
            pr: 2,
          },
        }}
      />
    </Paper>
  )
}

export default CustomTable