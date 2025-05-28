# 🍽️ Canteen Tracker App

## Overview
Canteen Tracker App is a web application designed to manage and track canteen activities, including user authentication, attendance, messaging, and reporting. Built with Next.js, MongoDB, and Tailwind CSS, it provides a modern and efficient interface for both admins and users.

## Features
- User authentication (login, signup, password reset)
- Admin dashboard for managing users, students, and settings
- Attendance tracking
- Messaging system
- User profile management
- Secure password handling with bcrypt
- Responsive and modern UI with Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v16 or above recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation
1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd canteen
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Create a `.env.local` file in the root directory and add the following variables:

### Sample `.env.local`
```env
MONGODB_URI=mongodb://localhost:27017/canteen
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password
```

### Running the App
```sh
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `src/app/` - Main application pages and API routes
- `src/components/` - Reusable UI and feature components
- `src/lib/` - Database and utility libraries
- `src/types/` - TypeScript type definitions
- `public/` - Static assets

## License
This project is licensed under the MIT License.









