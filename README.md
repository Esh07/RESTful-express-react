# Welcome to RESTful-express-react

This web application consists of a RESTful API and a React app. The API is a simple CRUD API for a list of users, built using Express.js. The front-end is built using React.js, incorporating Redux Toolkit (RTK) and other tools.

## Table of Contents

- [Features](#features)
  - [RESTful API](#restful-api)
    - [User Authentication](#user-authentication)
    - [User Management](#user-management)
    - [JWT-based authentication](#jwt-based-authentication)
  - [React App](#react-app)
    - [User Interface](#user-interface)
    - [State Management](#state-management)
    - [Responsive Design](#responsive-design)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Clone the repository](#clone-the-repository)
  - [Setting up the API (backend)](#setting-up-the-api-backend)
  - [Setting up the React app (frontend)](#setting-up-the-react-app-frontend)

### Features

- **RESTful API**:

  - User Authentication:
    - Register: POST `/user/register`
    - Login: POST `/user/login`
    - Logout: POST `/user/logout`
  - User Management:
    - Get all users: GET `/user` (admin only)
    - Get current user detail: GET `/user`
  - JWT-based authentication
    - Access token:
      - HTTP-only cookie
      - Expires in 3 hours validity (configurable)
    - Refresh token:
      - HTTP-only cookie
      - Expires in 24 hours validity (configurable)

- **React App**:
  - User Interface
    - User Registration & Login Form
    - User List (admin only)
    - User Profile (current user only)
  - State Management
    - Redux Toolkit (RTK)
  - Responsive Design
    - Mobile-first (mobile-friendly) design
    - Responsive UI layouts

## Installation

The installation process is divided into two parts: setting up the API (backend - express app) and setting up the React app.

#### Prerequisites

- Node.js (v20.10.0 or higher)
- npm

#### Clone the repository

```bash
git clone https://github.com/Esh07/RESTful-express-react.git
cd RESTful-express-react
```

This command will clone the repository to your local machine. Navigate to the project directory, which contains two subdirectories: `backend` and `frontend-app`.

#### Setting up the API (backend)

Follow the installation instructions from [backend/README.md](backend/README.md).

#### Setting up the React app (frontend)

Follow the installation instructions from [frontend-app/README.md](frontend-app/README.md).
