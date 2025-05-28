const axios = require('axios');
const faker = require('@faker-js/faker').faker;

const API_URL = 'http://localhost:5000/api';

// Admin credentials
const ADMIN_EMAIL = 'msmajemusa4@gmail.com';
const ADMIN_PASSWORD = '123456';

let ADMIN_TOKEN = '';

// Function to login and get admin token
const loginAdmin = async () => {
  try {
    const response = await axios.post(API_URL + '/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    ADMIN_TOKEN = response.data.data.token;
    console.log('Admin login successful, token obtained.');
  } catch (error) {
    console.error('Admin login failed:', error.response ? error.response.data : error.message);
    throw new Error('Cannot proceed without admin token');
  }
};

// Generate 1000 student users
const generateUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName).toLowerCase();
    users.push({
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: 'student',
      phone: faker.phone.number(),
      dateOfBirth: faker.date.past(20, new Date(2005, 0, 1)),
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      address_street: faker.address.streetAddress(),
      address_city: faker.address.city(),
      address_state: faker.address.state(),
      address_zipCode: faker.address.zipCode(),
      address_country: faker.address.country(),
      isActive: true
    });
  }
  return users;
};

// Generate 1000 student records linked to users
const generateStudents = (users) => {
  const students = [];
  users.forEach((user, index) => {
    students.push({
      userEmail: user.email,
      studentId: 'S' + (100000 + index),
      academicInfo: {
        program: faker.helpers.arrayElement(['Computer Science', 'Business Administration', 'Engineering']),
        major: faker.helpers.arrayElement(['CS', 'BA', 'ENG']),
        faculty: faker.helpers.arrayElement(['Science', 'Business', 'Engineering']),
        enrollmentDate: faker.date.past(4),
        expectedGraduation: faker.date.future(1),
        currentYear: faker.helpers.arrayElement(['Freshman', 'Sophomore', 'Junior', 'Senior']),
        currentSemester: faker.helpers.arrayElement(['Fall 2024', 'Spring 2024']),
        academicStatus: faker.helpers.arrayElement(['Good Standing', 'Probation']),
        gpa: parseFloat((Math.random() * 4).toFixed(2)),
        totalCredits: faker.datatype.number({ min: 0, max: 120 })
      },
      emergencyContact: {
        name: faker.name.findName(),
        phone: faker.phone.number(),
        relationship: faker.helpers.arrayElement(['Parent', 'Sibling', 'Guardian'])
      },
      medicalInfo: {
        allergies: faker.helpers.arrayElement(['None', 'Peanuts', 'Gluten']),
        medications: faker.helpers.arrayElement(['None', 'Ibuprofen']),
        conditions: faker.helpers.arrayElement(['None', 'Asthma'])
      }
    });
  });
  return students;
};

const uploadData = async (endpoint, data) => {
  try {
    const response = await axios.post(API_URL + '/bulk-upload/' + endpoint, data, {
      headers: {
        Authorization: 'Bearer ' + ADMIN_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    console.log('Upload to ' + endpoint + ' successful:', response.data);
  } catch (error) {
    console.error('Upload to ' + endpoint + ' failed:', error.response ? error.response.data : error.message);
  }
};

const main = async () => {
  await loginAdmin();

  const users = generateUsers(1000);
  await uploadData('users', users);

  const students = generateStudents(users);
  await uploadData('students', students);
};

main();
