import { Course } from '@/store/slices/courseSlice'

// Mock course data for testing
export const mockCourses: Course[] = [
  {
    _id: '1',
    courseCode: 'CS101',
    title: 'Introduction to Computer Science',
    description: 'An introductory course covering fundamental concepts of computer science including programming basics, algorithms, and data structures.',
    credits: 3,
    level: 'undergraduate',
    department: 'Computer Science',
    instructor: {
      _id: 'inst1',
      user: {
        firstName: 'Dr. John',
        lastName: 'Smith'
      },
      position: 'Professor'
    },
    maxEnrollment: 30,
    currentEnrollment: 25,
    status: 'active',
    schedule: {
      sessions: [
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          location: {
            building: 'Science Building',
            room: '101'
          }
        },
        {
          day: 'Wednesday',
          startTime: '09:00',
          endTime: '10:30',
          location: {
            building: 'Science Building',
            room: '101'
          }
        }
      ]
    },
    prerequisites: [],
    materials: [
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isRequired: true
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isRequired: false
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '2',
    courseCode: 'CS201',
    title: 'Data Structures and Algorithms',
    description: 'Advanced study of data structures and algorithms including trees, graphs, sorting, and searching algorithms.',
    credits: 4,
    level: 'undergraduate',
    department: 'Computer Science',
    instructor: {
      _id: 'inst2',
      user: {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson'
      },
      position: 'Associate Professor'
    },
    maxEnrollment: 25,
    currentEnrollment: 20,
    status: 'active',
    schedule: {
      sessions: [
        {
          day: 'Tuesday',
          startTime: '14:00',
          endTime: '15:30',
          location: {
            building: 'Computer Lab',
            room: '201'
          }
        },
        {
          day: 'Thursday',
          startTime: '14:00',
          endTime: '15:30',
          location: {
            building: 'Computer Lab',
            room: '201'
          }
        }
      ]
    },
    prerequisites: [
      {
        course: {
          courseCode: 'CS101'
        },
        minimumGrade: 'C+'
      }
    ],
    materials: [
      {
        title: 'Data Structures and Algorithm Analysis',
        author: 'Mark Allen Weiss',
        isRequired: true
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '3',
    courseCode: 'MATH101',
    title: 'Calculus I',
    description: 'Introduction to differential and integral calculus with applications.',
    credits: 4,
    level: 'undergraduate',
    department: 'Mathematics',
    instructor: {
      _id: 'inst3',
      user: {
        firstName: 'Prof. Michael',
        lastName: 'Brown'
      },
      position: 'Professor'
    },
    maxEnrollment: 40,
    currentEnrollment: 35,
    status: 'active',
    schedule: {
      sessions: [
        {
          day: 'Monday',
          startTime: '11:00',
          endTime: '12:00',
          location: {
            building: 'Math Building',
            room: '301'
          }
        },
        {
          day: 'Wednesday',
          startTime: '11:00',
          endTime: '12:00',
          location: {
            building: 'Math Building',
            room: '301'
          }
        },
        {
          day: 'Friday',
          startTime: '11:00',
          endTime: '12:00',
          location: {
            building: 'Math Building',
            room: '301'
          }
        }
      ]
    },
    prerequisites: [],
    materials: [
      {
        title: 'Calculus: Early Transcendentals',
        author: 'James Stewart',
        isRequired: true
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '4',
    courseCode: 'ENG101',
    title: 'English Composition',
    description: 'Development of writing skills through practice in various forms of composition.',
    credits: 3,
    level: 'undergraduate',
    department: 'English',
    instructor: {
      _id: 'inst4',
      user: {
        firstName: 'Dr. Emily',
        lastName: 'Davis'
      },
      position: 'Assistant Professor'
    },
    maxEnrollment: 20,
    currentEnrollment: 20,
    status: 'active',
    schedule: {
      sessions: [
        {
          day: 'Tuesday',
          startTime: '10:00',
          endTime: '11:30',
          location: {
            building: 'Liberal Arts',
            room: '205'
          }
        },
        {
          day: 'Thursday',
          startTime: '10:00',
          endTime: '11:30',
          location: {
            building: 'Liberal Arts',
            room: '205'
          }
        }
      ]
    },
    prerequisites: [],
    materials: [
      {
        title: 'The Bedford Handbook',
        author: 'Diana Hacker',
        isRequired: true
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export const mockEnrolledCourses: Course[] = [
  mockCourses[0], // CS101
  mockCourses[2]  // MATH101
]

// Mock API functions for testing
export const mockApiService = {
  getAvailableCourses: (filters?: { search?: string; department?: string; level?: string }) => {
    let filteredCourses = [...mockCourses]
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        course.courseCode.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters?.department) {
      filteredCourses = filteredCourses.filter(course => 
        course.department === filters.department
      )
    }
    
    if (filters?.level) {
      filteredCourses = filteredCourses.filter(course => 
        course.level === filters.level
      )
    }
    
    return Promise.resolve({
      data: {
        data: filteredCourses
      }
    })
  },
  
  getEnrolledCourses: () => {
    return Promise.resolve({
      data: {
        data: mockEnrolledCourses
      }
    })
  },
  
  getCourseById: (id: string) => {
    const course = mockCourses.find(c => c._id === id)
    return Promise.resolve({
      data: {
        data: course
      }
    })
  }
}
