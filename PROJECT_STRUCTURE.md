# College Management System - Project Structure

## Overview
This project consists of three main components:
1. **Backend API** (Node.js/Express) - Port 5000
2. **Admin Frontend** (React/Vite) - Port 3001
3. **Student Frontend** (React/Vite) - Port 3002

## Directory Structure

```
College_Management_System_Advanced/
│
├── backend/                          # Backend API Server
│   ├── controllers/                  # Business logic controllers
│   ├── middleware/                   # Custom middleware (auth, validation)
│   ├── models/                       # Database models (Mongoose schemas)
│   │   ├── User.js                   # Base user model
│   │   ├── Student.js                # Student-specific model
│   │   ├── Staff.js                  # Staff-specific model
│   │   └── Course.js                 # Course model
│   ├── routes/                       # API route definitions
│   ├── utils/                        # Utility functions
│   ├── uploads/                      # File upload directory
│   ├── .env.example                  # Environment variables template
│   ├── package.json                  # Backend dependencies
│   └── server.js                     # Main server file
│
├── admin_frontend/                   # Admin & Staff Interface
│   ├── components/                   # Reusable React components
│   ├── pages/                        # Next.js pages
│   ├── services/                     # API service functions
│   ├── hooks/                        # Custom React hooks
│   ├── types/                        # TypeScript type definitions
│   ├── utils/                        # Frontend utility functions
│   ├── styles/                       # CSS and styling files
│   ├── public/                       # Static assets
│   ├── next.config.js                # Next.js configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── package.json                  # Frontend dependencies
│
├── student_frontend/                 # Student Interface
│   ├── components/                   # Reusable React components
│   ├── pages/                        # Next.js pages
│   ├── services/                     # API service functions
│   ├── hooks/                        # Custom React hooks
│   ├── types/                        # TypeScript type definitions
│   ├── utils/                        # Frontend utility functions
│   ├── styles/                       # CSS and styling files
│   ├── public/                       # Static assets
│   ├── next.config.js                # Next.js configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── package.json                  # Frontend dependencies
│
├── README.md                         # Main project documentation
└── PROJECT_STRUCTURE.md             # This file
```

## Key Features by Component

### Backend API Features
- **Authentication & Authorization**: JWT-based auth with role-based access
- **User Management**: CRUD operations for users with different roles
- **Student Management**: Academic records, enrollment, GPA calculation
- **Staff Management**: Employee records, course assignments, qualifications
- **Course Management**: Course creation, scheduling, enrollment management
- **File Upload**: Profile images and document management
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling and logging

### Admin Frontend Features
- **Dashboard**: System overview with statistics and charts
- **Student Management**:
  - View all students with filtering and search
  - Add new students with form validation
  - Edit student information and academic records
  - Manage student enrollments and grades
- **Staff Management**:
  - View all staff members with department filtering
  - Add new staff with qualification tracking
  - Assign courses to instructors
  - Manage administrative roles
- **Course Management**:
  - Create and edit courses with scheduling
  - Manage course prerequisites and materials
  - View enrollment statistics
  - Handle course announcements
- **Reports**: Generate academic and administrative reports
- **Settings**: System configuration and user management

### Student Frontend Features
- **Student Dashboard**: Personal academic overview and quick stats
- **Course Catalog**: Browse available courses with filtering
- **Enrollment**: Enroll in courses with prerequisite checking
- **Academic Records**: View grades, GPA, and transcript
- **Schedule**: Personal class schedule and calendar view
- **Profile Management**: Update personal information and preferences
- **Announcements**: View course and system announcements
- **Resources**: Access course materials and assignments

## Database Models

### User Model (Base)
- Personal information (name, email, contact)
- Authentication data (password, role)
- Account status and verification
- Profile image and preferences

### Student Model (Extends User)
- Student ID and academic information
- Program, year, and semester details
- Enrolled courses with grades
- GPA and credit tracking
- Emergency contact information

### Staff Model (Extends User)
- Employee ID and position details
- Department and employment information
- Teaching assignments and course load
- Qualifications and research areas
- Office hours and administrative roles

### Course Model
- Course code, title, and description
- Credits, level, and department
- Prerequisites and schedule
- Instructor and enrollment management
- Assessments and materials
- Announcements and resources

## API Endpoints Structure

### Authentication Routes (`/api/auth`)
- POST `/login` - User authentication
- POST `/register` - User registration
- POST `/logout` - User logout
- GET `/profile` - Get current user profile
- PUT `/profile` - Update user profile

### Student Routes (`/api/students`)
- GET `/` - Get all students (admin/staff only)
- GET `/:id` - Get student by ID
- POST `/` - Create new student (admin only)
- PUT `/:id` - Update student information
- DELETE `/:id` - Delete student (admin only)
- GET `/:id/courses` - Get student's enrolled courses
- POST `/:id/enroll` - Enroll student in course

### Staff Routes (`/api/staff`)
- GET `/` - Get all staff (admin only)
- GET `/:id` - Get staff by ID
- POST `/` - Create new staff (admin only)
- PUT `/:id` - Update staff information
- DELETE `/:id` - Delete staff (admin only)
- GET `/:id/courses` - Get staff's teaching courses
- POST `/:id/assign` - Assign course to staff

### Course Routes (`/api/courses`)
- GET `/` - Get all courses
- GET `/:id` - Get course by ID
- POST `/` - Create new course (admin/staff only)
- PUT `/:id` - Update course information
- DELETE `/:id` - Delete course (admin only)
- GET `/:id/students` - Get enrolled students
- POST `/:id/enroll` - Enroll student in course

## Technology Stack Details

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **multer**: File upload handling
- **cors**: Cross-origin resource sharing

### Frontend Technologies
- **Next.js 14**: React framework with SSR/SSG
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful hand-crafted SVG icons
- **React Hook Form**: Performant forms with validation
- **React Query**: Data fetching and caching
- **Axios**: HTTP client for API requests
- **Recharts**: Composable charting library

## Development Workflow

### Initial Setup
1. Install dependencies for all three components
2. Set up environment variables
3. Start MongoDB database
4. Run backend server
5. Start both frontend applications

### Development Process
1. Backend-first development for API endpoints
2. Create corresponding frontend components
3. Implement authentication and authorization
4. Add data validation and error handling
5. Write tests for critical functionality
6. Optimize performance and user experience

### Deployment Considerations
- Backend: Deploy to services like Heroku, DigitalOcean, or AWS
- Frontend: Deploy to Vercel, Netlify, or similar platforms
- Database: Use MongoDB Atlas for cloud database
- Environment: Separate staging and production environments
- Security: Implement HTTPS, rate limiting, and input sanitization
