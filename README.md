# College Management System

A comprehensive college management system with separate interfaces for administrators/staff and students.

## Project Structure

```
College_Management_System_Advanced/
├── backend/                 # Shared backend API
├── admin_frontend/         # Admin and staff interface
├── student_frontend/       # Student interface
└── README.md
```

## Features

### Backend API
- **User Management**: Authentication and authorization for students, staff, and admins
- **Student Management**: Student profiles, enrollment, academic records
- **Staff Management**: Staff profiles, course assignments, administrative roles
- **Course Management**: Course creation, scheduling, enrollment management
- **RESTful API**: Well-structured endpoints for all operations

### Admin Frontend (Port 3001)
- **Dashboard**: Overview of system statistics
- **Student Management**: Add, edit, view student records
- **Staff Management**: Manage faculty and staff
- **Course Management**: Create and manage courses
- **Reports**: Academic and administrative reports

### Student Frontend (Port 3002)
- **Student Dashboard**: Personal academic overview
- **Course Enrollment**: Browse and enroll in courses
- **Academic Records**: View grades and transcripts
- **Profile Management**: Update personal information

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing

### Frontend (Both Admin & Student)
- **Framework**: React 18 with Vite and TypeScript
- **Build Tool**: Vite (latest)
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons & Lucide React
- **HTTP Client**: Axios
- **State Management**: TanStack React Query
- **Forms**: React Hook Form

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd College_Management_System_Advanced
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file with your configuration
   npm run dev
   ```

3. **Admin Frontend Setup**
   ```bash
   cd admin_frontend
   npm install
   cp .env.example .env
   # Edit .env file with your configuration
   npm run dev
   ```

4. **Student Frontend Setup**
   ```bash
   cd student_frontend
   npm install
   cp .env.example .env
   # Edit .env file with your configuration
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/college_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_ADMIN_URL=http://localhost:3001
FRONTEND_STUDENT_URL=http://localhost:3002
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create new staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

## Database Models

### User Model
- Basic user information (name, email, password)
- Role-based access (student, staff, admin)
- Contact and profile information

### Student Model
- Student-specific information (student ID, program, year)
- Academic performance (GPA, credits)
- Course enrollments and grades

### Staff Model
- Staff-specific information (employee ID, position, department)
- Teaching assignments and course load
- Qualifications and research information

### Course Model
- Course details (code, title, description, credits)
- Schedule and location information
- Enrollment management and prerequisites

## Development Guidelines

1. **Code Style**: Follow TypeScript and ESLint configurations
2. **API Design**: RESTful principles with proper HTTP status codes
3. **Security**: Input validation, authentication, and authorization
4. **Error Handling**: Comprehensive error handling and logging
5. **Testing**: Unit and integration tests for critical functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
