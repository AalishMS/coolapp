import React, { useState, useCallback, useMemo } from 'react'
import Select, { StylesConfig } from 'react-select'
import { Box, TextField, Chip, Typography } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

interface Option {
  value: string
  label: string
  category?: string
  description?: string
  data?: any
}

interface AdvancedSearchProps {
  options: Option[]
  value?: Option[]
  onChange: (selectedOptions: Option[]) => void
  placeholder?: string
  isMulti?: boolean
  searchable?: boolean
  clearable?: boolean
  loading?: boolean
  onSearch?: (query: string) => void
  filterOption?: (option: Option, query: string) => boolean
  noOptionsMessage?: string
  maxSelectedValues?: number
}

const customStyles: StylesConfig<Option, true> = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? '#1976D2' : '#ccc',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(25, 118, 210, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#1976D2',
    },
    minHeight: '56px',
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: '#E3F2FD',
    borderRadius: '16px',
  }),
  multiValueLabel: (baseStyles) => ({
    ...baseStyles,
    color: '#1976D2',
    fontWeight: 500,
  }),
  multiValueRemove: (baseStyles) => ({
    ...baseStyles,
    color: '#1976D2',
    '&:hover': {
      backgroundColor: '#BBDEFB',
      color: '#1565C0',
    },
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: state.isSelected ? '#1976D2' : state.isFocused ? '#E3F2FD' : 'white',
    color: state.isSelected ? 'white' : '#333',
    '&:active': {
      backgroundColor: '#1976D2',
      color: 'white',
    },
  }),
  noOptionsMessage: (baseStyles) => ({
    ...baseStyles,
    padding: '16px',
    textAlign: 'center',
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#999',
  }),
}

const AdvancedSearch = ({
  options,
  value = [],
  onChange,
  placeholder = 'Search...',
  isMulti = true,
  searchable = true,
  clearable = true,
  loading = false,
  onSearch,
  filterOption,
  noOptionsMessage = 'No options found',
  maxSelectedValues,
}: AdvancedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Default filter option
  const defaultFilterOption = useCallback((option: Option, query: string) => {
    const searchLower = query.toLowerCase()
    return (
      option.label.toLowerCase().includes(searchLower) ||
      (option.description && option.description.toLowerCase().includes(searchLower)) ||
      (option.category && option.category.toLowerCase().includes(searchLower))
    )
  }, [])

  const handleInputChange = useCallback((inputValue: string) => {
    setSearchQuery(inputValue)
    if (onSearch) {
      onSearch(inputValue)
    }
  }, [onSearch])

  // Group options by category
  const groupedOptions = useMemo(() => {
    const grouped: { [key: string]: Option[] } = {}
    
    options.forEach(option => {
      const category = option.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(option)
    })

    return Object.entries(grouped).map(([category, categoryOptions]) => ({
      label: category,
      options: categoryOptions,
    }))
  }, [options])

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return groupedOptions

    const filtered = groupedOptions.map(group => ({
      ...group,
      options: group.options.filter(option => 
        (filterOption || defaultFilterOption)(option, searchQuery)
      ),
    })).filter(group => group.options.length > 0)

    return filtered
  }, [groupedOptions, searchQuery, filterOption, defaultFilterOption])

  const handleChange = useCallback((selectedOptions: any) => {
    const maxValues = maxSelectedValues || Infinity
    if (isMulti && Array.isArray(selectedOptions)) {
      onChange(selectedOptions.slice(0, maxValues))
    } else {
      onChange(selectedOptions ? [selectedOptions] : [])
    }
  }, [onChange, isMulti, maxSelectedValues])

  const formatOptionLabel = useCallback((option: Option) => {
    return (
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {option.label}
        </Typography>
        {option.description && (
          <Typography variant="caption" color="text.secondary" display="block">
            {option.description}
          </Typography>
        )}
        {option.category && (
          <Chip
            label={option.category}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        )}
      </Box>
    )
  }, [])

  const formatGroupLabel = useCallback((groupData: any) => (
    <Box>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        {groupData.label}
      </Typography>
    </Box>
  ), [])

  return (
    <Box>
      <Select
        options={filteredOptions}
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        placeholder={placeholder}
        isMulti={isMulti}
        isSearchable={searchable}
        isClearable={clearable}
        isLoading={loading}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        formatGroupLabel={formatGroupLabel}
        noOptionsMessage={() => noOptionsMessage}
        components={{
          DropdownIndicator: () => <SearchIcon sx={{ mr: 2, color: 'text.secondary' }} />,
          IndicatorSeparator: () => null,
        }}
      />
      
      {isMulti && maxSelectedValues && value.length >= maxSelectedValues && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Maximum {maxSelectedValues} items selected
        </Typography>
      )}
    </Box>
  )
}

export default AdvancedSearch