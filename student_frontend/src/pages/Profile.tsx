import { useState } from 'react'
import { useAuthStore } from '@/hooks/useAuthStore'
import { Tab } from '@headlessui/react'
import {
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import PersonalInfo from '@/components/profile/PersonalInfo'
import AcademicInfo from '@/components/profile/AcademicInfo'
import Documents from '@/components/profile/Documents'
import ProfilePicture from '@/components/profile/ProfilePicture'
import SecuritySettings from '@/components/profile/SecuritySettings'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Profile = () => {
  const { user } = useAuthStore()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const tabs = [
    {
      name: 'Personal Information',
      icon: UserIcon,
      component: PersonalInfo
    },
    {
      name: 'Academic Information',
      icon: AcademicCapIcon,
      component: AcademicInfo
    },
    {
      name: 'Documents',
      icon: DocumentTextIcon,
      component: Documents
    },
    {
      name: 'Security Settings',
      icon: ShieldCheckIcon,
      component: SecuritySettings
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-6">
            <ProfilePicture />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-lg text-gray-600">{user?.email}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Student ID: STU-{user?._id?.slice(-6).toUpperCase()}</span>
                <span>•</span>
                <span>Role: {user?.role}</span>
                {user?.role === 'admin' && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">Admin View</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="bg-white shadow rounded-lg">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 rounded-t-lg bg-gray-50 p-1">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-3 px-4 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                  )
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="p-6">
            {tabs.map((tab, index) => (
              <Tab.Panel key={index}>
                <tab.component />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

export default Profile
