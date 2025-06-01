import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  UserIcon,
  HomeIcon,
  HeartIcon,
  CreditCardIcon,
  UsersIcon,
  DocumentTextIcon,
  PrinterIcon,
  XMarkIcon,
  // SaveIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'

interface StudentFormData {
  // Bio-Data
  firstName: string
  lastName: string
  middleName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  nationality: string
  stateOfOrigin: string
  localGovernment: string
  religion: string
  maritalStatus: string
  bloodGroup: string
  genotype: string

  // Admission
  studentId: string
  program: string
  department: string
  faculty: string
  admissionDate: string
  admissionType: string
  entryMode: string
  year: number
  semester: number
  expectedGraduation: string

  // Address
  permanentAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contactAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  // Next of Kin
  nextOfKin: {
    firstName: string
    lastName: string
    relationship: string
    phone: string
    email: string
    address: string
    occupation: string
  }

  // Sponsor
  sponsor: {
    firstName: string
    lastName: string
    relationship: string
    phone: string
    email: string
    address: string
    occupation: string
    organization: string
  }

  // Parent/Guardian
  parent: {
    fatherName: string
    fatherPhone: string
    fatherEmail: string
    fatherOccupation: string
    motherName: string
    motherPhone: string
    motherEmail: string
    motherOccupation: string
    guardianName: string
    guardianPhone: string
    guardianEmail: string
    guardianRelationship: string
  }

  // Medical Information
  medicalInfo: {
    allergies: string
    medications: string
    medicalConditions: string
    emergencyContact: string
    bloodType: string
    physicianName: string
    physicianPhone: string
    insuranceProvider: string
    insuranceNumber: string
  }
}

interface StudentModalProps {
  student: any
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'view'
}

const StudentModal = ({ student, isOpen, onClose, mode }: StudentModalProps) => {
  const [activeTab, setActiveTab] = useState<'bio-data' | 'admission' | 'address' | 'next-of-kin' | 'sponsor' | 'parent' | 'signature'>('bio-data')
  const [formData, setFormData] = useState<StudentFormData>({
    // Bio-Data
    firstName: student?.user?.firstName || '',
    lastName: student?.user?.lastName || '',
    middleName: student?.middleName || '',
    email: student?.user?.email || '',
    phone: student?.user?.phone || '',
    dateOfBirth: student?.user?.dateOfBirth ? new Date(student.user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: student?.user?.gender || '',
    nationality: student?.nationality || 'Nigerian',
    stateOfOrigin: student?.stateOfOrigin || '',
    localGovernment: student?.localGovernment || '',
    religion: student?.religion || '',
    maritalStatus: student?.maritalStatus || 'single',
    bloodGroup: student?.bloodGroup || '',
    genotype: student?.genotype || '',

    // Admission
    studentId: student?.studentId || '',
    program: student?.program || '',
    department: student?.department || '',
    faculty: student?.faculty || '',
    admissionDate: student?.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : '',
    admissionType: student?.admissionType || 'regular',
    entryMode: student?.entryMode || 'utme',
    year: student?.year || 1,
    semester: student?.semester || 1,
    expectedGraduation: student?.expectedGraduation ? new Date(student.expectedGraduation).toISOString().split('T')[0] : '',

    // Address
    permanentAddress: {
      street: student?.permanentAddress?.street || '',
      city: student?.permanentAddress?.city || '',
      state: student?.permanentAddress?.state || '',
      zipCode: student?.permanentAddress?.zipCode || '',
      country: student?.permanentAddress?.country || 'Nigeria'
    },
    contactAddress: {
      street: student?.contactAddress?.street || '',
      city: student?.contactAddress?.city || '',
      state: student?.contactAddress?.state || '',
      zipCode: student?.contactAddress?.zipCode || '',
      country: student?.contactAddress?.country || 'Nigeria'
    },

    // Next of Kin
    nextOfKin: {
      firstName: student?.nextOfKin?.firstName || '',
      lastName: student?.nextOfKin?.lastName || '',
      relationship: student?.nextOfKin?.relationship || '',
      phone: student?.nextOfKin?.phone || '',
      email: student?.nextOfKin?.email || '',
      address: student?.nextOfKin?.address || '',
      occupation: student?.nextOfKin?.occupation || ''
    },

    // Sponsor
    sponsor: {
      firstName: student?.sponsor?.firstName || '',
      lastName: student?.sponsor?.lastName || '',
      relationship: student?.sponsor?.relationship || '',
      phone: student?.sponsor?.phone || '',
      email: student?.sponsor?.email || '',
      address: student?.sponsor?.address || '',
      occupation: student?.sponsor?.occupation || '',
      organization: student?.sponsor?.organization || ''
    },

    // Parent/Guardian
    parent: {
      fatherName: student?.parent?.fatherName || '',
      fatherPhone: student?.parent?.fatherPhone || '',
      fatherEmail: student?.parent?.fatherEmail || '',
      fatherOccupation: student?.parent?.fatherOccupation || '',
      motherName: student?.parent?.motherName || '',
      motherPhone: student?.parent?.motherPhone || '',
      motherEmail: student?.parent?.motherEmail || '',
      motherOccupation: student?.parent?.motherOccupation || '',
      guardianName: student?.parent?.guardianName || '',
      guardianPhone: student?.parent?.guardianPhone || '',
      guardianEmail: student?.parent?.guardianEmail || '',
      guardianRelationship: student?.parent?.guardianRelationship || ''
    },

    // Medical Information
    medicalInfo: {
      allergies: student?.medicalInfo?.allergies || '',
      medications: student?.medicalInfo?.medications || '',
      medicalConditions: student?.medicalInfo?.medicalConditions || '',
      emergencyContact: student?.medicalInfo?.emergencyContact || '',
      bloodType: student?.medicalInfo?.bloodType || '',
      physicianName: student?.medicalInfo?.physicianName || '',
      physicianPhone: student?.medicalInfo?.physicianPhone || '',
      insuranceProvider: student?.medicalInfo?.insuranceProvider || '',
      insuranceNumber: student?.medicalInfo?.insuranceNumber || ''
    }
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === 'create') {
        const response = await api.post('/students', data)
        return response.data
      } else if (mode === 'edit') {
        const response = await api.put(`/students/${student._id}`, data)
        return response.data
      }
    },
    onSuccess: () => {
      toast.success(`Student ${mode}d successfully!`)
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student-stats'] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${mode} student`)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => {
      const sectionValue = prev[section as keyof StudentFormData];
      if (typeof sectionValue !== 'object' || sectionValue === null) {
        // If section is not an object, return prev without changes to avoid spread error
        return prev;
      }
      return {
        ...prev,
        [section]: {
          ...sectionValue,
          [field]: value
        }
      };
    });
  }

  const tabs = [
    { id: 'bio-data', name: 'Bio-Data', icon: UserIcon },
    { id: 'admission', name: 'Admission', icon: AcademicCapIcon },
    { id: 'address', name: 'Address', icon: HomeIcon },
    { id: 'next-of-kin', name: 'Next of Kin', icon: HeartIcon },
    { id: 'sponsor', name: 'Sponsor', icon: CreditCardIcon },
    { id: 'parent', name: 'Parent', icon: UsersIcon },
    { id: 'signature', name: 'Signature', icon: DocumentTextIcon }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' && 'Add New Student'}
            {mode === 'edit' && 'Edit Student'}
            {mode === 'view' && 'Student Details'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio-Data Tab */}
          {activeTab === 'bio-data' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.middleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  required
                  className="input-field"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State of Origin</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.stateOfOrigin}
                  onChange={(e) => setFormData(prev => ({ ...prev, stateOfOrigin: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local Government</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.localGovernment}
                  onChange={(e) => setFormData(prev => ({ ...prev, localGovernment: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <select
                  className="input-field"
                  value={formData.religion}
                  onChange={(e) => setFormData(prev => ({ ...prev, religion: e.target.value }))}
                >
                  <option value="">Select Religion</option>
                  <option value="christianity">Christianity</option>
                  <option value="islam">Islam</option>
                  <option value="traditional">Traditional</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  className="input-field"
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  className="input-field"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genotype</label>
                <select
                  className="input-field"
                  value={formData.genotype}
                  onChange={(e) => setFormData(prev => ({ ...prev, genotype: e.target.value }))}
                >
                  <option value="">Select Genotype</option>
                  <option value="AA">AA</option>
                  <option value="AS">AS</option>
                  <option value="AC">AC</option>
                  <option value="SS">SS</option>
                  <option value="SC">SC</option>
                  <option value="CC">CC</option>
                </select>
              </div>
            </div>
          )}

          {/* Admission Tab */}
          {activeTab === 'admission' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.studentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value.toUpperCase() }))}
                  placeholder="e.g., STU2024001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                <select
                  required
                  className="input-field"
                  value={formData.program}
                  onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                >
                  <option value="">Select Program</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Arts and Humanities">Arts and Humanities</option>
                  <option value="Natural Sciences">Natural Sciences</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                <select
                  className="input-field"
                  value={formData.faculty}
                  onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
                >
                  <option value="">Select Faculty</option>
                  <option value="Science">Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Arts">Arts</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Law">Law</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, admissionDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Type</label>
                <select
                  className="input-field"
                  value={formData.admissionType}
                  onChange={(e) => setFormData(prev => ({ ...prev, admissionType: e.target.value }))}
                >
                  <option value="regular">Regular</option>
                  <option value="transfer">Transfer</option>
                  <option value="direct_entry">Direct Entry</option>
                  <option value="part_time">Part Time</option>
                  <option value="distance_learning">Distance Learning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Mode</label>
                <select
                  className="input-field"
                  value={formData.entryMode}
                  onChange={(e) => setFormData(prev => ({ ...prev, entryMode: e.target.value }))}
                >
                  <option value="utme">UTME</option>
                  <option value="direct_entry">Direct Entry</option>
                  <option value="transfer">Transfer</option>
                  <option value="postgraduate">Postgraduate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Year *</label>
                <select
                  required
                  className="input-field"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                  <option value={5}>Year 5</option>
                  <option value={6}>Year 6</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester *</label>
                <select
                  required
                  className="input-field"
                  value={formData.semester}
                  onChange={(e) => setFormData(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.expectedGraduation}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedGraduation: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-8">
              {/* Permanent Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <textarea
                      rows={3}
                      className="input-field"
                      value={formData.permanentAddress.street}
                      onChange={(e) => updateFormData('permanentAddress', 'street', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.permanentAddress.city}
                      onChange={(e) => updateFormData('permanentAddress', 'city', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.permanentAddress.state}
                      onChange={(e) => updateFormData('permanentAddress', 'state', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.permanentAddress.zipCode}
                      onChange={(e) => updateFormData('permanentAddress', 'zipCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.permanentAddress.country}
                      onChange={(e) => updateFormData('permanentAddress', 'country', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Address */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Contact Address</h3>
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-800 text-sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        contactAddress: { ...prev.permanentAddress }
                      }))
                    }}
                  >
                    Same as Permanent
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <textarea
                      rows={3}
                      className="input-field"
                      value={formData.contactAddress.street}
                      onChange={(e) => updateFormData('contactAddress', 'street', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.contactAddress.city}
                      onChange={(e) => updateFormData('contactAddress', 'city', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.contactAddress.state}
                      onChange={(e) => updateFormData('contactAddress', 'state', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.contactAddress.zipCode}
                      onChange={(e) => updateFormData('contactAddress', 'zipCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.contactAddress.country}
                      onChange={(e) => updateFormData('contactAddress', 'country', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next of Kin Tab */}
          {activeTab === 'next-of-kin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.nextOfKin.firstName}
                  onChange={(e) => updateFormData('nextOfKin', 'firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.nextOfKin.lastName}
                  onChange={(e) => updateFormData('nextOfKin', 'lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  className="input-field"
                  value={formData.nextOfKin.relationship}
                  onChange={(e) => updateFormData('nextOfKin', 'relationship', e.target.value)}
                >
                  <option value="">Select Relationship</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="spouse">Spouse</option>
                  <option value="guardian">Guardian</option>
                  <option value="relative">Relative</option>
                  <option value="friend">Friend</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.nextOfKin.phone}
                  onChange={(e) => updateFormData('nextOfKin', 'phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.nextOfKin.email}
                  onChange={(e) => updateFormData('nextOfKin', 'email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.nextOfKin.occupation}
                  onChange={(e) => updateFormData('nextOfKin', 'occupation', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={formData.nextOfKin.address}
                  onChange={(e) => updateFormData('nextOfKin', 'address', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Sponsor Tab */}
          {activeTab === 'sponsor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.sponsor.firstName}
                  onChange={(e) => updateFormData('sponsor', 'firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.sponsor.lastName}
                  onChange={(e) => updateFormData('sponsor', 'lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  className="input-field"
                  value={formData.sponsor.relationship}
                  onChange={(e) => updateFormData('sponsor', 'relationship', e.target.value)}
                >
                  <option value="">Select Relationship</option>
                  <option value="parent">Parent</option>
                  <option value="guardian">Guardian</option>
                  <option value="relative">Relative</option>
                  <option value="employer">Employer</option>
                  <option value="government">Government</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="self">Self</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.sponsor.phone}
                  onChange={(e) => updateFormData('sponsor', 'phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.sponsor.email}
                  onChange={(e) => updateFormData('sponsor', 'email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.sponsor.occupation}
                  onChange={(e) => updateFormData('sponsor', 'occupation', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.sponsor.organization}
                  onChange={(e) => updateFormData('sponsor', 'organization', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={formData.sponsor.address}
                  onChange={(e) => updateFormData('sponsor', 'address', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Parent Tab */}
          {activeTab === 'parent' && (
            <div className="space-y-8">
              {/* Father Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Father's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.parent.fatherName}
                      onChange={(e) => updateFormData('parent', 'fatherName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.parent.fatherPhone}
                      onChange={(e) => updateFormData('parent', 'fatherPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={formData.parent.fatherEmail}
                      onChange={(e) => updateFormData('parent', 'fatherEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.parent.fatherOccupation}
                      onChange={(e) => updateFormData('parent', 'fatherOccupation', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Mother Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mother's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.parent.motherName}
                      onChange={(e) => updateFormData('parent', 'motherName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.parent.motherPhone}
                      onChange={(e) => updateFormData('parent', 'motherPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={formData.parent.motherEmail}
                      onChange={(e) => updateFormData('parent', 'motherEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.parent.motherOccupation}
                      onChange={(e) => updateFormData('parent', 'motherOccupation', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information (if applicable)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.parent.guardianName}
                      onChange={(e) => updateFormData('parent', 'guardianName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.parent.guardianPhone}
                      onChange={(e) => updateFormData('parent', 'guardianPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={formData.parent.guardianEmail}
                      onChange={(e) => updateFormData('parent', 'guardianEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <select
                      className="input-field"
                      value={formData.parent.guardianRelationship}
                      onChange={(e) => updateFormData('parent', 'guardianRelationship', e.target.value)}
                    >
                      <option value="">Select Relationship</option>
                      <option value="uncle">Uncle</option>
                      <option value="aunt">Aunt</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="sibling">Sibling</option>
                      <option value="family_friend">Family Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Signature Tab */}
          {activeTab === 'signature' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Declaration and Signature</h3>
                <div className="bg-gray-50 p-6 rounded-lg text-left">
                  <p className="text-sm text-gray-700 mb-4">
                    I hereby declare that all the information provided in this form is true and accurate to the best of my knowledge.
                    I understand that any false information may result in the rejection of my application or termination of my enrollment.
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    I agree to abide by all the rules and regulations of the institution and understand that failure to comply
                    may result in disciplinary action including suspension or expulsion.
                  </p>
                  <p className="text-sm text-gray-700">
                    I consent to the collection and processing of my personal data for academic and administrative purposes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Signature</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Digital signature will be captured here</p>
                    <button type="button" className="mt-2 text-primary-600 hover:text-primary-800 text-sm">
                      Upload Signature
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="input-field"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    readOnly
                  />
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I confirm that all information provided is accurate
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="btn-primary flex-1"
            >
              {mutation.isLoading ? 'Saving...' : mode === 'create' ? 'Add Student' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Students = () => {
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showModal, setShowModal] = useState(false)
  // const printRef = useRef<HTMLDivElement>(null)

  const queryClient = useQueryClient()

  const { data: studentsData, isLoading, error } = useQuery({
    queryKey: ['students', search, programFilter, yearFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (programFilter) params.append('program', programFilter)
      if (yearFilter) params.append('year', yearFilter)
      if (statusFilter) params.append('status', statusFilter)

      const response = await api.get(`/students?${params.toString()}`)
      return response.data
    }
  })

  // Get student statistics
  const { data: studentStats } = useQuery({
    queryKey: ['student-stats'],
    queryFn: async () => {
      const response = await api.get('/students/stats')
      return response.data.data
    }
  })

  // Get courses for display
  const { data: coursesData } = useQuery({
    queryKey: ['courses-overview'],
    queryFn: async () => {
      const response = await api.get('/courses?limit=5')
      return response.data
    }
  })

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await api.delete(`/students/${studentId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Student deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete student')
    }
  })

  const openModal = (mode: 'create' | 'edit' | 'view', student?: any) => {
    setModalMode(mode)
    setSelectedStudent(student)
    setShowModal(true)
  }

  const handleDelete = (student: any) => {
    if (window.confirm(`Are you sure you want to delete ${student.user?.firstName} ${student.user?.lastName}? This action cannot be undone.`)) {
      deleteMutation.mutate(student._id)
    }
  }

  const handlePrintProfile = (student: any) => {
    // Generate and print student profile
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Student Profile - ${student.user?.firstName} ${student.user?.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Student Profile</h1>
              <h2>${student.user?.firstName} ${student.user?.lastName}</h2>
              <p>Student ID: ${student.studentId}</p>
            </div>
            <div class="section">
              <h3>Personal Information</h3>
              <div class="field"><span class="label">Email:</span> ${student.user?.email}</div>
              <div class="field"><span class="label">Phone:</span> ${student.user?.phone}</div>
              <div class="field"><span class="label">Date of Birth:</span> ${student.user?.dateOfBirth ? new Date(student.user.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
              <div class="field"><span class="label">Gender:</span> ${student.user?.gender || 'N/A'}</div>
            </div>
            <div class="section">
              <h3>Academic Information</h3>
              <div class="field"><span class="label">Program:</span> ${student.program}</div>
              <div class="field"><span class="label">Year:</span> ${student.year}</div>
              <div class="field"><span class="label">Semester:</span> ${student.semester}</div>
              <div class="field"><span class="label">GPA:</span> ${student.gpa}</div>
              <div class="field"><span class="label">Status:</span> ${student.status}</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handlePrintMedicalForm = (student: any) => {
    // Generate and print medical form
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Form - ${student.user?.firstName} ${student.user?.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .checkbox { margin-right: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Medical Information Form</h1>
              <h2>${student.user?.firstName} ${student.user?.lastName}</h2>
              <p>Student ID: ${student.studentId}</p>
            </div>
            <div class="section">
              <h3>Basic Medical Information</h3>
              <div class="field"><span class="label">Blood Group:</span> ${student.bloodGroup || '_______'}</div>
              <div class="field"><span class="label">Genotype:</span> ${student.genotype || '_______'}</div>
              <div class="field"><span class="label">Height:</span> _______</div>
              <div class="field"><span class="label">Weight:</span> _______</div>
            </div>
            <div class="section">
              <h3>Medical History</h3>
              <div class="field"><span class="label">Known Allergies:</span> ________________________</div>
              <div class="field"><span class="label">Current Medications:</span> ________________________</div>
              <div class="field"><span class="label">Chronic Conditions:</span> ________________________</div>
            </div>
            <div class="section">
              <h3>Emergency Contact</h3>
              <div class="field"><span class="label">Name:</span> ${student.emergencyContact?.name || '_______'}</div>
              <div class="field"><span class="label">Relationship:</span> ${student.emergencyContact?.relationship || '_______'}</div>
              <div class="field"><span class="label">Phone:</span> ${student.emergencyContact?.phone || '_______'}</div>
            </div>
            <div class="section">
              <h3>Medical Examination</h3>
              <p><input type="checkbox" class="checkbox"> General Physical Examination</p>
              <p><input type="checkbox" class="checkbox"> Vision Test</p>
              <p><input type="checkbox" class="checkbox"> Hearing Test</p>
              <p><input type="checkbox" class="checkbox"> Blood Pressure</p>
              <p><input type="checkbox" class="checkbox"> Laboratory Tests</p>
            </div>
            <div class="section">
              <h3>Physician's Declaration</h3>
              <p>I certify that I have examined the above-named student and found them:</p>
              <p><input type="checkbox" class="checkbox"> Fit for academic activities</p>
              <p><input type="checkbox" class="checkbox"> Fit with restrictions</p>
              <p><input type="checkbox" class="checkbox"> Unfit for academic activities</p>
              <br>
              <p>Physician's Name: _______________________</p>
              <p>Signature: _________________ Date: _______</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

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
        <div className="text-red-600 mb-4">Error loading students</div>
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="mt-1 text-blue-100">
              Comprehensive student records and academic management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => openModal('create')}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add New Student</span>
            </button>
            <AcademicCapIcon className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Student Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentStats?.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentStats?.activeStudents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentStats?.newThisMonth || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Programs</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentStats?.programCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      {coursesData?.data?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coursesData.data.slice(0, 6).map((course: any) => (
              <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{course.courseCode}</h3>
                    <p className="text-sm text-gray-500">{course.title}</p>
                    <p className="text-xs text-gray-400">
                      {course.currentEnrollment}/{course.maxEnrollment} enrolled
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Student Records</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
          >
            <option value="">All Programs</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Medicine">Medicine</option>
            <option value="Arts and Humanities">Arts and Humanities</option>
            <option value="Natural Sciences">Natural Sciences</option>
          </select>
          <select
            className="input-field"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
            <option value="5">Year 5</option>
            <option value="6">Year 6</option>
          </select>
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>

        {/* Students Table */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year/Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentsData?.data?.map((student: any) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.user?.firstName} {student.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.program}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Year {student.year}, Sem {student.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.gpa?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : student.status === 'graduated'
                        ? 'bg-blue-100 text-blue-800'
                        : student.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view', student)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit', student)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit Student"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrintProfile(student)}
                        className="text-green-600 hover:text-green-900"
                        title="Print Profile"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrintMedicalForm(student)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Print Medical Form"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Student"
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
        {studentsData?.pagination && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((studentsData.pagination.page - 1) * studentsData.pagination.limit) + 1} to{' '}
              {Math.min(studentsData.pagination.page * studentsData.pagination.limit, studentsData.pagination.total)} of{' '}
              {studentsData.pagination.total} students
            </div>
            <div className="flex space-x-2">
              <button
                disabled={studentsData.pagination.page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={studentsData.pagination.page === studentsData.pagination.pages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Modal */}
      <StudentModal
        student={selectedStudent}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
    </div>
  )
}

export default Students
