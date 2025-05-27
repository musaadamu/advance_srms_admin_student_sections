import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  BookOpenIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'

const Schedule = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  // Get student schedule
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['student-schedule'],
    queryFn: async () => {
      const response = await api.get('/students/schedule')
      return response.data.data
    }
  })

  // Get academic calendar
  const { data: academicCalendar } = useQuery({
    queryKey: ['academic-calendar'],
    queryFn: async () => {
      const response = await api.get('/academic-calendar')
      return response.data.data
    }
  })

  const getWeekDays = (date: Date) => {
    const week = []
    const startDate = new Date(date)
    const day = startDate.getDay()
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    startDate.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDays = getWeekDays(currentWeek)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  const getClassesForDay = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    return scheduleData?.enrolledCourses?.filter((course: any) => 
      course.schedule?.sessions?.some((session: any) => session.day === dayName)
    ) || []
  }

  const getClassesForTimeSlot = (date: Date, timeSlot: string) => {
    const classes = getClassesForDay(date)
    return classes.filter((course: any) => 
      course.schedule?.sessions?.some((session: any) => {
        const startTime = session.startTime?.substring(0, 5)
        return startTime === timeSlot
      })
    )
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newDate)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'lab':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'tutorial':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'examination':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Class Schedule</h1>
            <p className="mt-1 text-orange-100">
              View your weekly class schedule and academic calendar
            </p>
          </div>
          <CalendarDaysIcon className="h-16 w-16 text-orange-200" />
        </div>
      </div>

      {/* Schedule Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            Week of {weekDays[0].toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h2>
          
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="btn-secondary"
          >
            Today
          </button>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'week' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'month' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'week' ? (
        /* Weekly View */
        <div className="card overflow-hidden">
          <div className="grid grid-cols-8 gap-0">
            {/* Time column */}
            <div className="bg-gray-50 border-r border-gray-200">
              <div className="h-12 border-b border-gray-200"></div>
              {timeSlots.map(time => (
                <div key={time} className="h-16 border-b border-gray-200 p-2 text-sm text-gray-500">
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-200 last:border-r-0">
                {/* Day header */}
                <div className="h-12 border-b border-gray-200 p-2 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    day.toDateString() === new Date().toDateString() 
                      ? 'text-primary-600' 
                      : 'text-gray-900'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Time slots */}
                {timeSlots.map(timeSlot => {
                  const classes = getClassesForTimeSlot(day, timeSlot)
                  return (
                    <div key={timeSlot} className="h-16 border-b border-gray-200 p-1 relative">
                      {classes.map((course: any, index: number) => {
                        const session = course.schedule?.sessions?.find((s: any) => 
                          s.day === day.toLocaleDateString('en-US', { weekday: 'long' }) &&
                          s.startTime?.substring(0, 5) === timeSlot
                        )
                        
                        return (
                          <div
                            key={index}
                            className={`absolute inset-1 rounded p-1 text-xs border ${getEventColor(session?.type || 'lecture')}`}
                            style={{ 
                              height: `${Math.max(1, (parseInt(session?.endTime?.substring(0, 2)) - parseInt(session?.startTime?.substring(0, 2))) * 64 - 8)}px`
                            }}
                          >
                            <div className="font-medium truncate">{course.courseCode}</div>
                            <div className="truncate">{course.title}</div>
                            {session?.location && (
                              <div className="flex items-center mt-1">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                <span className="truncate">{session.location.building} {session.location.room}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Monthly View */
        <div className="card">
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Monthly View</h3>
            <p className="mt-1 text-sm text-gray-500">
              Monthly calendar view coming soon
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Classes</h2>
          <div className="space-y-3">
            {getClassesForDay(new Date()).map((course: any) => (
              <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {course.courseCode} - {course.title}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        {course.schedule?.sessions?.map((session: any, index: number) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {session.startTime} - {session.endTime}
                            </div>
                            {session.location && (
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {session.location.building} {session.location.room}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    course.schedule?.sessions?.[0]?.type === 'lecture' 
                      ? 'bg-blue-100 text-blue-800'
                      : course.schedule?.sessions?.[0]?.type === 'lab'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {course.schedule?.sessions?.[0]?.type || 'Lecture'}
                  </span>
                </div>
              </div>
            ))}
            {getClassesForDay(new Date()).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No classes scheduled for today
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Academic Events</h2>
          <div className="space-y-3">
            {academicCalendar?.slice(0, 5).map((event: any) => (
              <div key={event._id} className="border-l-4 border-primary-400 pl-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(event.startDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.type === 'examination' 
                      ? 'bg-red-100 text-red-800'
                      : event.type === 'registration'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.type}
                  </span>
                  {event.location && (
                    <span className="text-xs text-gray-500">{event.location}</span>
                  )}
                </div>
              </div>
            ))}
            {(!academicCalendar || academicCalendar.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                No upcoming events
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Schedule
