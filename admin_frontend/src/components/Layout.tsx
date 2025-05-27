import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import {
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition, Disclosure } from '@headlessui/react'
import { Fragment } from 'react'
import { getNavigationForRole, type NavigationItem } from '@/config/navigation'
import { getRoleByName } from '@/config/roles'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    console.log('🚪 Admin logout button clicked')
    logout()
    console.log('✅ Admin user logged out, redirecting to login...')
    navigate('/login', { replace: true })
  }

  // Get role-based navigation
  const navigation = user ? getNavigationForRole(user.role) : []
  const userRoleInfo = user ? getRoleByName(user.role) : null

  // Function to render navigation items
  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    const isActive = location.pathname === item.href
    const baseClasses = isMobile
      ? 'group flex items-center px-2 py-2 text-base font-medium rounded-md'
      : 'group flex items-center px-2 py-2 text-sm font-medium rounded-md'

    const activeClasses = isActive
      ? 'bg-primary-100 text-primary-900'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'

    const iconClasses = isActive
      ? 'text-primary-500'
      : 'text-gray-400 group-hover:text-gray-500'

    if (item.children && item.children.length > 0) {
      return (
        <Disclosure key={item.name}>
          {({ open }) => (
            <>
              <Disclosure.Button className={`${baseClasses} ${activeClasses} w-full justify-between`}>
                <div className="flex items-center">
                  <item.icon className={`${iconClasses} mr-3 flex-shrink-0 h-6 w-6`} />
                  {item.name}
                </div>
                <ChevronRightIcon
                  className={`${open ? 'rotate-90' : ''} h-4 w-4 transform transition-transform`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    to={child.href}
                    className={`${
                      location.pathname === child.href
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center pl-11 pr-2 py-2 text-sm font-medium rounded-md`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    {child.name}
                  </Link>
                ))}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <item.icon className={`${iconClasses} mr-3 flex-shrink-0 h-6 w-6`} />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <div className="relative z-40 md:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <h1 className="text-lg font-semibold text-gray-900">
                      {userRoleInfo?.displayName || 'Admin Panel'}
                    </h1>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {navigation.map((item) => renderNavigationItem(item, true))}
                  </nav>
                </div>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" />
          </div>
        </div>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {userRoleInfo?.displayName || 'Admin Panel'}
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => renderNavigationItem(item, false))}
            </nav>
          </div>
        </div>
      </div>

      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-200">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <h2 className="text-lg font-medium text-gray-900 ml-3">
                      College Management System
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown */}
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-xs text-blue-600 font-medium">{userRoleInfo?.displayName}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="http://localhost:3002"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <UserIcon className="mr-3 h-4 w-4" />
                            View Student Portal
                          </a>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
