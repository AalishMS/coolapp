import React, { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Box, Typography, Button, Alert, AlertTitle, LinearProgress, IconButton } from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  acceptedFileTypes?: string[]
  maxFileSize?: number // in bytes
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  showProgress?: boolean
  progress?: number
  error?: string | null
  onClearError?: () => void
}

const FileUpload = ({
  onUpload,
  acceptedFileTypes = ['.csv', '.xlsx', '.json', '.jpg', '.jpeg', '.png'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  multiple = true,
  disabled = false,
  showProgress = false,
  progress = 0,
  error = null,
  onClearError,
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0]
      const error = rejection.errors[0]
      
      if (error.code === 'file-too-large') {
        onClearError?.()
        // You might want to set an error state here
        console.error(`File ${rejection.file.name} is too large`)
      } else if (error.code === 'file-invalid-type') {
        onClearError?.()
        console.error(`File ${rejection.file.name} has invalid type`)
      }
      return
    }

    setUploadedFiles(acceptedFiles)
    
    try {
      await onUpload(acceptedFiles)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }, [onUpload, onClearError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: acceptedFileTypes.reduce((acc, type) => {
      const mimeType = type === '.csv' ? 'text/csv' :
                     type === '.xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                     type === '.json' ? 'application/json' :
                     type === '.jpg' || type === '.jpeg' ? 'image/jpeg' :
                     type === '.png' ? 'image/png' : '*/*'
      acc[mimeType] = [type]
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    maxFiles,
    multiple,
    disabled: disabled || showProgress,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatAcceptedTypes = () => {
    return acceptedFileTypes.join(', ')
  }

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${dragActive ? 'primary.main' : 'grey.300'}`,
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: dragActive ? 'action.hover' : 'grey.50',
          transition: 'all 0.2s ease-in-out',
          opacity: disabled ? 0.6 : 1,
          '&:hover': {
            backgroundColor: disabled ? 'grey.50' : 'action.hover',
            borderColor: disabled ? 'grey.300' : 'primary.main',
          },
        }}
      >
        <input {...getInputProps()} />
        
        {showProgress ? (
          <Box>
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Uploading...
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mb: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {progress.toFixed(0)}% complete
            </Typography>
          </Box>
        ) : (
          <Box>
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or
            </Typography>
            <Button
              variant="contained"
              component="span"
              disabled={disabled}
              onClick={(e) => e.stopPropagation()}
            >
              Browse Files
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Accepted formats: {formatAcceptedTypes()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Max file size: {formatFileSize(maxFileSize)}
            </Typography>
            {maxFiles > 1 && (
              <Typography variant="caption" color="text.secondary" display="block">
                Max files: {maxFiles}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Upload Error</AlertTitle>
          {error}
          {onClearError && (
            <Button size="small" onClick={onClearError} sx={{ mt: 1 }}>
              Dismiss
            </Button>
          )}
        </Alert>
      )}

      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Files
          </Typography>
          {uploadedFiles.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                border: 1,
                borderColor: 'grey.300',
                borderRadius: 1,
                mb: 1,
                backgroundColor: 'grey.50',
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <FileIcon color="action" />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
              </Box>
              {!showProgress && (
                <IconButton
                  size="small"
                  onClick={() => removeFile(index)}
                  color="error"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default FileUpload