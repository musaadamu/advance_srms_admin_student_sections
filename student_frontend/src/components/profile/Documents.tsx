import { useState, useRef } from 'react'
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  EyeIcon, 
  TrashIcon,
  DocumentArrowDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  category: 'academic' | 'personal' | 'financial' | 'other'
  url?: string
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Transcript_Fall_2024.pdf',
      type: 'application/pdf',
      size: 245760,
      uploadDate: '2024-01-15',
      category: 'academic',
      url: '/documents/transcript.pdf'
    },
    {
      id: '2',
      name: 'Birth_Certificate.pdf',
      type: 'application/pdf',
      size: 156432,
      uploadDate: '2024-01-10',
      category: 'personal',
      url: '/documents/birth_cert.pdf'
    },
    {
      id: '3',
      name: 'Financial_Aid_Form.pdf',
      type: 'application/pdf',
      size: 324567,
      uploadDate: '2024-01-08',
      category: 'financial',
      url: '/documents/financial_aid.pdf'
    }
  ])
  
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'academic', label: 'Academic' },
    { value: 'personal', label: 'Personal' },
    { value: 'financial', label: 'Financial' },
    { value: 'other', label: 'Other' }
  ]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('word')) return '📝'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    return '📎'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800'
      case 'personal':
        return 'bg-green-100 text-green-800'
      case 'financial':
        return 'bg-yellow-100 text-yellow-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        // Create new document entry
        const newDocument: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'other', // Default category
          url: URL.createObjectURL(file) // Temporary URL for preview
        }

        // TODO: Replace with actual API call
        // const formData = new FormData()
        // formData.append('document', file)
        // const response = await api.post('/documents/upload', formData)

        setDocuments(prev => [...prev, newDocument])
        toast.success(`${file.name} uploaded successfully!`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload documents')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // TODO: Replace with actual API call
      // await api.delete(`/documents/${documentId}`)
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      toast.success('Document deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  const handleViewDocument = (document: Document) => {
    if (document.url) {
      window.open(document.url, '_blank')
    } else {
      toast.error('Document preview not available')
    }
  }

  const handleDownloadDocument = (document: Document) => {
    if (document.url) {
      const link = document.createElement('a')
      link.href = document.url
      link.download = document.name
      link.click()
    } else {
      toast.error('Document download not available')
    }
  }

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Documents</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-4">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCategory === category.value
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCategory === 'all' 
                ? 'Get started by uploading your first document.'
                : `No documents in the ${selectedCategory} category.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getFileIcon(document.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(document.category)}`}>
                          {document.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(document.size)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Uploaded {new Date(document.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDocument(document)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View document"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(document)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Download document"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete document"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <CloudArrowUpIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Upload Guidelines</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Maximum file size: 10MB</li>
                <li>Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
                <li>Keep document names descriptive</li>
                <li>Organize documents by category for easy access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

export default Documents
