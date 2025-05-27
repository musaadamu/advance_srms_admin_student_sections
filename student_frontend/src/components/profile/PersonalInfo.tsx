import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/hooks/useAuthStore'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface PersonalInfoForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

const PersonalInfo = () => {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<PersonalInfoForm>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || ''
      }
    }
  })

  const onSubmit = async (data: PersonalInfoForm) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // await api.put('/auth/profile', data)
      
      // Update local user state
      if (user) {
        updateUser({
          ...user,
          ...data
        })
      }

      toast.success('Personal information updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update personal information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading || !isDirty}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              {...register('firstName', { required: 'First name is required' })}
              type="text"
              disabled={!isEditing}
              className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              {...register('lastName', { required: 'Last name is required' })}
              type="text"
              disabled={!isEditing}
              className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              disabled={!isEditing}
              className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              {...register('phone')}
              type="tel"
              disabled={!isEditing}
              className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              {...register('dateOfBirth')}
              type="date"
              disabled={!isEditing}
              className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              {...register('gender')}
              disabled={!isEditing}
              className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Address Information */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Address Information</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Street Address</label>
              <input
                {...register('address.street')}
                type="text"
                disabled={!isEditing}
                className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                {...register('address.city')}
                type="text"
                disabled={!isEditing}
                className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State/Province</label>
              <input
                {...register('address.state')}
                type="text"
                disabled={!isEditing}
                className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP/Postal Code</label>
              <input
                {...register('address.zipCode')}
                type="text"
                disabled={!isEditing}
                className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                {...register('address.country')}
                type="text"
                disabled={!isEditing}
                className="mt-1 input-field disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PersonalInfo
