import { FileText, FileArchive, FileImage, File } from 'lucide-react'

export function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const extensionIcons = {
  pdf: FileText,
  zip: FileArchive,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  webp: FileImage,
}

export function getFileIcon(fileName = '') {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return extensionIcons[ext] || File
}
