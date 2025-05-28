import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../store'
import {
  fetchUsers,
  fetchUserStats,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  resetUserPassword,
  setFilters,
  // clearError
} from '../store/slices/userSlice'
import {
  // PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  AcademicCapIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  // CheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  password?: string
  phone: string
  role: 'student' | 'staff' | 'admin'
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

interface UserModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'view'
}

const UserModal = ({ user, isOpen, onClose, mode }: UserModalProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    phone: user?.phone || '',
    role: user?.role || 'student',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'Nigeria'
    }
  })

  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector(state => state.users)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'create') {
        await dispatch(createUser(formData)).unwrap()
        toast.success('User created successfully!')
      } else if (mode === 'edit') {
        await dispatch(updateUser({ userId: user._id, userData: formData })).unwrap()
        toast.success('User updated successfully!')
      }
      onClose()
    } catch (error: any) {
      toast.error(error || `Failed to ${mode} user`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' && 'Add New User'}
            {mode === 'edit' && 'Edit User'}
            {mode === 'view' && 'User Details'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={mode === 'view'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={mode === 'view'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={mode === 'view'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={mode === 'view'}
              />
            </div>
            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  minLength={6}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                required
                className="input-field"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                disabled={mode === 'view'}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                className="input-field"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                disabled={mode === 'view'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="input-field"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                disabled={mode === 'view'}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.address.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value }
                  }))}
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {mode !== 'view' && (
            <div className="flex space-x-3 pt-6 border-t">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Add User' : 'Update User'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

const Users = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'students' | 'password-reset' | 'assign-roles'>('staff')
  // const [search, setSearch] = useState('')
  // const [roleFilter, setRoleFilter] = useState('')
  // const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showModal, setShowModal] = useState(false)

  // Password Reset State
  const [resetEmail, setResetEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Role Assignment State
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null)
  const [newRole, setNewRole] = useState<'student' | 'staff' | 'admin'>('student')

  const dispatch = useAppDispatch()
  const {
    users,
    userStats,
    pagination,
    isLoading,
    error,
    filters
  } = useAppSelector(state => state.users)

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const params: any = { ...filters }

    // Set role filter based on active tab
    if (activeTab === 'staff') {
      params.role = 'staff'
    } else if (activeTab === 'students') {
      params.role = 'student'
    }

    dispatch(fetchUsers(params))
  }, [dispatch, activeTab, filters])

  // Fetch user statistics on mount
  useEffect(() => {
    dispatch(fetchUserStats())
  }, [dispatch])

  // Handle search filter changes
  const handleSearchChange = (searchTerm: string) => {
    dispatch(setFilters({ search: searchTerm }))
  }

  const handleStatusFilterChange = (status: string) => {
    dispatch(setFilters({ status }))
  }

  const openModal = (mode: 'create' | 'edit' | 'view', user?: any) => {
    setModalMode(mode)
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleDelete = async (user: any) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteUser(user._id)).unwrap()
        toast.success('User deleted successfully!')
      } catch (error: any) {
        toast.error(error || 'Failed to delete user')
      }
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      await dispatch(resetUserPassword({ email: resetEmail, newPassword })).unwrap()
      toast.success('Password reset successfully!')
      setResetEmail('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error || 'Failed to reset password')
    }
  }

  const handleRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForRole) {
      toast.error('Please select a user')
      return
    }
    try {
      await dispatch(updateUserRole({ userId: selectedUserForRole._id, role: newRole })).unwrap()
      toast.success('User role updated successfully!')
      setSelectedUserForRole(null)
      setNewRole('student')
    } catch (error: any) {
      toast.error(error || 'Failed to update user role')
    }
  }

  const tabs = [
    { id: 'staff', name: 'Staff', icon: UserGroupIcon },
    { id: 'students', name: 'Students', icon: AcademicCapIcon },
    { id: 'password-reset', name: 'Password Reset', icon: KeyIcon },
    { id: 'assign-roles', name: 'Assign User Roles', icon: ShieldCheckIcon }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading users</div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="mt-1 text-purple-100">
              Comprehensive user administration and role management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => openModal('create')}
              className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <UserPlusIcon className="h-5 w-5" />
              <span>Add New User</span>
            </button>
            <UsersIcon className="h-16 w-16 text-purple-200" />
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats?.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Staff Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats?.staffCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats?.studentCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats?.adminCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Staff and Students Tabs Content */}
        {(activeTab === 'staff' || activeTab === 'students') && (
          <>
            {/* Filters */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="input-field pl-10"
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users?.map((user: any) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'staff'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('view', user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openModal('edit', user)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Password Reset Tab */}
        {activeTab === 'password-reset' && (
          <div className="mt-6 max-w-2xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Password Reset Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This action will reset the user's password. The user will need to use the new password to log in.
                      Make sure to communicate the new password securely to the user.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email *
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter user's email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <LockClosedIcon className="h-4 w-4" />
                  <span>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assign User Roles Tab */}
        {activeTab === 'assign-roles' && (
          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Role Assignment Form */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Role to User</h3>

                <form onSubmit={handleRoleAssignment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select User *
                    </label>
                    <select
                      required
                      className="input-field"
                      value={selectedUserForRole?._id || ''}
                      onChange={(e) => {
                        const user = users?.find((u: any) => u._id === e.target.value)
                        setSelectedUserForRole(user)
                      }}
                    >
                      <option value="">Choose a user...</option>
                      {users?.map((user: any) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.email}) - Current: {user.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Role *
                    </label>
                    <select
                      required
                      className="input-field"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {selectedUserForRole && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Role Change Summary</h4>
                      <div className="text-sm text-blue-700">
                        <p><strong>User:</strong> {selectedUserForRole.firstName} {selectedUserForRole.lastName}</p>
                        <p><strong>Email:</strong> {selectedUserForRole.email}</p>
                        <p><strong>Current Role:</strong> {selectedUserForRole.role}</p>
                        <p><strong>New Role:</strong> {newRole}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForRole(null)
                        setNewRole('student')
                      }}
                      className="btn-secondary flex-1"
                    >
                      Clear Selection
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !selectedUserForRole}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span>
                        {isLoading ? 'Updating...' : 'Update Role'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Role Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h3>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <AcademicCapIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Student</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Access to student portal</li>
                      <li>• View courses and grades</li>
                      <li>• Course registration</li>
                      <li>• View academic records</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Staff</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Manage courses and students</li>
                      <li>• Grade management</li>
                      <li>• Academic reporting</li>
                      <li>• Limited administrative access</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Admin</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Full system access</li>
                      <li>• User management</li>
                      <li>• System configuration</li>
                      <li>• All administrative functions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        user={selectedUser}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
    </div>
  )
}

export default Users
