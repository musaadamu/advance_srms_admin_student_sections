import { useState, useRef } from 'react'
import { useAuthStore } from '@/hooks/useAuthStore'
import { CameraIcon, UserIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const ProfilePicture = () => {
  const { user, updateUser } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('profileImage', file)

      // TODO: Replace with actual API call
      // const response = await api.post('/auth/upload-profile-image', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // })

      // For now, create a local URL for preview
      const imageUrl = URL.createObjectURL(file)
      
      // Update user profile with new image
      if (user) {
        updateUser({
          ...user,
          profileImage: imageUrl
        })
      }

      toast.success('Profile picture updated successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100">
            <UserIcon className="w-12 h-12 text-primary-600" />
          </div>
        )}
        
        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2 shadow-lg disabled:opacity-50"
            title="Change profile picture"
          >
            <CameraIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Upload button for mobile/accessibility */}
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="absolute -bottom-2 -right-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg transition-colors duration-200 disabled:opacity-50"
        title="Change profile picture"
      >
        <CameraIcon className="w-4 h-4" />
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Loading indicator */}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}

export default ProfilePicture
