import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/hooks/useAuthStore'
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface PasswordChangeForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const SecuritySettings = () => {
  const { user } = useAuthStore()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<PasswordChangeForm>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: PasswordChangeForm) => {
    setIsChangingPassword(true)
    try {
      // TODO: Replace with actual API call
      // await api.put('/auth/change-password', {
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Password changed successfully!')
      reset()
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Failed to change password. Please check your current password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const strengthMap = {
      0: { label: 'Very Weak', color: 'bg-red-500' },
      1: { label: 'Weak', color: 'bg-red-400' },
      2: { label: 'Fair', color: 'bg-yellow-400' },
      3: { label: 'Good', color: 'bg-blue-400' },
      4: { label: 'Strong', color: 'bg-green-400' },
      5: { label: 'Very Strong', color: 'bg-green-500' }
    }

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] }
  }

  const passwordStrength = getPasswordStrength(newPassword || '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
      </div>

      {/* Account Security Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Account Security Status</h4>
            <div className="mt-2 space-y-1 text-sm text-blue-700">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Email verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Strong password policy enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Two-factor authentication: Not enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <KeyIcon className="h-5 w-5 text-gray-400" />
          <h4 className="text-md font-medium text-gray-900">Change Password</h4>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="mt-1 relative">
              <input
                {...register('currentPassword', { 
                  required: 'Current password is required' 
                })}
                type={showPasswords.current ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1 relative">
              <input
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                  }
                })}
                type={showPasswords.new ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="mt-1 relative">
              <input
                {...register('confirmPassword', { 
                  required: 'Please confirm your new password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                type={showPasswords.confirm ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword || !isValid}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Security Recommendations</h4>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Use a unique password that you don't use for other accounts</li>
                <li>Include a mix of uppercase and lowercase letters, numbers, and symbols</li>
                <li>Avoid using personal information like your name or birthdate</li>
                <li>Consider enabling two-factor authentication for extra security</li>
                <li>Change your password regularly (every 3-6 months)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-gray-500">Account Created</label>
            <p className="text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-gray-500">Last Login</label>
            <p className="text-gray-900">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-gray-500">Email Status</label>
            <p className="text-gray-900">
              {user?.isEmailVerified ? (
                <span className="text-green-600">Verified</span>
              ) : (
                <span className="text-red-600">Not Verified</span>
              )}
            </p>
          </div>
          <div>
            <label className="block text-gray-500">Account Status</label>
            <p className="text-gray-900">
              {user?.isActive ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-red-600">Inactive</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecuritySettings
