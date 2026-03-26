# HealthNexus

Smart Healthcare Appointment & Management System (MERN Stack)

HealthNexus is a healthcare appointment and management platform developed during my internship as a real-world simulation of how digital healthcare systems can support patients, doctors, and administrators.

The project started as **HealthNexus**, with the original landing page focused on appointment booking, doctor discovery, services, and healthcare tools. The current codebase has evolved into an updated branded version of the same idea, and parts of the deployed app now use the name **CareVista**.

## About the Project

The goal of HealthNexus was to build a practical healthcare platform where:

- Patients can book and track appointments
- Doctors can review assigned appointments and manage schedules
- Admins can monitor the system and manage operational workflows

This project was built using the **MERN stack**:

- **MongoDB**
- **Express.js**
- **React.js**
- **Node.js**

It combines a public healthcare website with role-based dashboards for different users.

## Project Background

This was my **internship project**, and the original concept and interface were built under the name **HealthNexus**.

The original landing page included modules such as:

- Doctor search
- Online appointment scheduling
- Services and health tools
- Admin dashboard entry
- Basic healthcare service cards

As the project developed further, the application structure expanded and the UI branding changed in the current version.

## Current Implementation

The current application includes:

### Public Website
- Home page
- Departments page
- Doctors page
- About page
- Contact page
- Appointment booking page
- Static fallback content if backend data is unavailable

### Patient Features
- Patient registration
- Login
- Appointment booking tied to authenticated patient account
- Patient portal for appointment history and status tracking
- Appointment cancellation from patient dashboard

### Doctor Features
- Doctor login
- Doctor dashboard
- Assigned appointment review
- Patient list overview
- Schedule and availability management

### Admin Features
- Admin login
- Admin dashboard
- User monitoring
- Appointment and contact message management
- Doctor account creation
- Department creation
- Doctor and department availability management

## Role Access

The system currently supports three roles:

- **Patient**
- **Doctor**
- **Admin**

### Current Account Flow
- Public registration is available for **patients only**
- **Doctor accounts** are created internally by the admin
- **Admin accounts** are provisioned internally
- All roles log in through the same login page and are redirected to their respective dashboard

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- Token-based authentication
- Role-protected routes

### Deployment
- Vercel for frontend
- Render for backend
- MongoDB Atlas for database

## Project Structure

```text
carevista
├── backend
│   ├── middleware/
│   ├── models/
│   ├── seed/
│   ├── utils/
│   ├── authController.js
│   ├── authRoutes.js
│   ├── db.js
│   ├── portalController.js
│   ├── portalRoutes.js
│   ├── server.js
│   ├── siteController.js
│   ├── siteRoutes.js
│   └── package.json
│
├── frontend
│   ├── public/
│   ├── src/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── content/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── vercel.json
│
└── README.md
