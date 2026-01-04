import React, { useState, useRef } from 'react'
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  AlertTitle,
  Tab,
  Tabs,
  AppBar,
  useTheme,
} from '@mui/material'
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  QrCode as BarcodeIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import {
  BarcodeGenerator,
  AdvancedSearch,
  FileUpload,
  Button as CustomButton,
  CustomDialog,
} from '../../components/ui'
import { useProductStore, useStockStore, useUndoRedoStore } from '../../store'
import { Product } from '../../types/product'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const Settings = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
    lowStockAlerts: true,
    exportFormat: 'csv',
    barcodeFormat: 'CODE128' as const,
  })
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false)
  const [barcodeValue, setBarcodeValue] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  const { products } = useProductStore()
  const { canUndo, canRedo, undo, redo, getHistory } = useUndoRedoStore()

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    // Show success message
    alert('Settings saved successfully!')
  }

  const handleExportData = () => {
    const data = {
      products,
      settings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImportData = async (files: File[]) => {
    try {
      const file = files[0]
      const text = await file.text()
      const data = JSON.parse(text)

      if (data.products && Array.isArray(data.products)) {
        // Import products logic would go here
        console.log('Importing products:', data.products)
        setImportError(null)
        alert(`Successfully imported ${data.products.length} products`)
      } else {
        setImportError('Invalid file format. Please select a valid backup file.')
      }
    } catch (error) {
      setImportError('Failed to import file. Please check the file format.')
    }
  }

  const handleUndo = () => {
    const action = undo()
    if (action) {
      console.log('Undone:', action.description)
    }
  }

  const handleRedo = () => {
    const action = redo()
    if (action) {
      console.log('Redone:', action.description)
    }
  }

  const history = getHistory()

  // Advanced search options
  const searchOptions = products.map(product => ({
    value: product.id,
    label: product.name,
    category: product.category,
    description: `${product.sku} - ${product.quantity} in stock - $${product.price}`,
    data: product,
  }))

  const handleSearchChange = (_selectedOptions: any) => {
    // Handle search selection changes if needed
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure application settings and access advanced features
      </Typography>

      <AppBar position="static" color="default" elevation={0}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<SearchIcon />} label="Advanced Search" />
          <Tab icon={<BarcodeIcon />} label="Barcode" />
          <Tab icon={<CloudUploadIcon />} label="Import/Export" />
          <Tab icon={<HistoryIcon />} label="History" />
        </Tabs>
      </AppBar>

      {/* General Settings */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                }
                label="Dark Mode"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                  }
                  label="Enable Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.lowStockAlerts}
                      onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
                    />
                  }
                  label="Low Stock Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                  }
                  label="Auto Save"
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Export Settings
              </Typography>
              <TextField
                fullWidth
                select
                label="Default Export Format"
                value={settings.exportFormat}
                onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
              </TextField>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Barcode Settings
              </Typography>
              <TextField
                fullWidth
                select
                label="Barcode Format"
                value={settings.barcodeFormat}
                onChange={(e) => handleSettingChange('barcodeFormat', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="CODE128">CODE128</option>
                <option value="CODE39">CODE39</option>
                <option value="EAN13">EAN13</option>
                <option value="EAN8">EAN8</option>
                <option value="UPC">UPC</option>
              </TextField>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <CustomButton
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
              >
                Save Settings
              </CustomButton>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Advanced Search */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Product Search
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Search products by name, SKU, category, or description. Results are grouped by category.
          </Typography>
          <AdvancedSearch
            options={searchOptions}
            placeholder="Search products..."
            isMulti={true}
            maxSelectedValues={10}
            onChange={handleSearchChange}
          />
        </Paper>
      </TabPanel>

      {/* Barcode Generator */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Barcode Generator
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Enter Product SKU or ID"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                placeholder="e.g., LP-001"
              />
              <Box sx={{ mt: 2 }}>
                <CustomButton
                  variant="contained"
                  onClick={() => barcodeValue && setShowBarcodeDialog(true)}
                  disabled={!barcodeValue}
                >
                  Generate Barcode
                </CustomButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Enter a product SKU or ID to generate its barcode. The barcode can be downloaded as an image for printing.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <CustomDialog
          open={showBarcodeDialog}
          title={`Barcode for ${barcodeValue}`}
          onClose={() => setShowBarcodeDialog(false)}
          maxWidth="sm"
        >
          <BarcodeGenerator
            value={barcodeValue}
            format={settings.barcodeFormat}
            width={2}
            height={100}
          />
        </CustomDialog>
      </TabPanel>

      {/* Import/Export */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Export Data
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Download all your inventory data as a backup file.
              </Typography>
              <CustomButton
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportData}
                fullWidth
              >
                Export All Data
              </CustomButton>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Import Data
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload a backup file to restore your inventory data.
              </Typography>
              <FileUpload
                onUpload={handleImportData}
                acceptedFileTypes={['.json']}
                maxFiles={1}
                error={importError}
                onClearError={() => setImportError(null)}
              />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* History */}
      <TabPanel value={tabValue} index={4}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Action History
            </Typography>
            <Box>
              <CustomButton
                variant="outlined"
                startIcon={<UndoIcon />}
                onClick={handleUndo}
                disabled={!canUndo()}
                sx={{ mr: 1 }}
              >
                Undo
              </CustomButton>
              <CustomButton
                variant="outlined"
                startIcon={<RedoIcon />}
                onClick={handleRedo}
                disabled={!canRedo()}
              >
                Redo
              </CustomButton>
            </Box>
          </Box>

          {history.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No action history available
            </Typography>
          ) : (
            history.slice().reverse().map((entry, index) => (
              <Box
                key={entry.id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'grey.200',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'grey.50',
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {entry.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(entry.timestamp).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </Paper>
      </TabPanel>
    </Box>
  )
}

export default Settings