# OCS Task 25-26

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase)

## Getting Started

### 1. Database Setup

Ensure your PostgreSQL instance is running and the connection string is set in `backend/.env`.
Run the SQL commands in `backend/database/init.sql` to create the necessary tables.

### 2. Backend

The backend runs on **Port 8000**.

```bash
cd backend
npm install
# Rename .env.example to .env and add your credentials
npm run dev
```

### 3. Frontend

The frontend runs on **Port 3000**.

```bash
cd frontend
npm install
npm run dev
```

---

## API Documentation

**Base URL**: `http://localhost:8000`

### Authentication

All protected endpoints require a **Bearer Token** in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Access Levels

| Role       | Description                                      |
|------------|--------------------------------------------------|
| `public`   | No authentication required                       |
| `student`  | Authenticated users with student role            |
| `recruiter`| Authenticated users with recruiter role          |
| `admin`    | Full access to all routes (bypasses role checks) |

---

## API Endpoints

### 1. Health Check Endpoints

#### `GET /`
**Access Level**: `public`

**Description**: Basic health check for the API.

**Request**: None

**Response**:
```json
{
  "message": "Recruitment API is running"
}
```

---

#### `GET /test-db`
**Access Level**: `public`

**Description**: Test database connection.

**Request**: None

**Response (Success)**:
```json
{
  "message": "Database connected successfully",
  "time": "2026-01-25T17:39:50.000Z"
}
```

**Response (Error)**:
```json
{
  "error": "Database connection failed",
  "details": "<error_message>"
}
```

---

### 2. Authentication Endpoints

#### `POST /api/login`
**Access Level**: `public`

**Description**: Authenticate a user from MD5 hashed password and receive a JWT token.

**Request Body**:
```json
{
  "userId": "string (required)",
  "password": "string (required)"
}
```

**Response (Success)**:
```json
{
  "message": "Login successful",
  "token": "<JWT_TOKEN>",
  "role": "student | recruiter | admin"
}
```

**Response (Error)**:
| Status | Response                                              |
|--------|-------------------------------------------------------|
| 400    | `{ "error": "User ID and password are required" }`    |
| 401    | `{ "error": "Invalid credentials" }`                  |
| 500    | `{ "error": "Internal server error" }`                |

---

### 3. Application Endpoints

#### `GET /api/application`
**Access Level**: `student`, `admin`

**Description**: Get all applications for the authenticated student.

**Headers**: `Authorization: Bearer <token>`

**Request**: None

**Response (Success)**:
```json
[
  {
    "profile_code": "string",
    "status": "Applied | Selected | Not Selected | Accepted | Rejected"
  }
]
```

**Response (Error)**:
| Status | Response                                           |
|--------|----------------------------------------------------|
| 400    | `{ "error": "User ID not found in token" }`        |
| 401    | `{ "error": "Access denied. No token provided." }` |
| 403    | `{ "error": "Invalid token." }`                    |
| 500    | `{ "error": "Internal server error" }`             |

---

#### `POST /api/application`
**Access Level**: `student`, `admin`

**Description**: Apply for a job profile.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "profileCode": "string (required)",
  "entryNumber": "string (optional, admin only - to apply on behalf of student)"
}
```

**Response (Success)**:
```json
{
  "profile_code": "string",
  "entry_number": "string",
  "status": "Applied"
}
```

**Response (Error)**:
| Status | Response                                              |
|--------|-------------------------------------------------------|
| 400    | `{ "error": "Profile code is required" }`             |
| 400    | `{ "error": "Already applied for this job" }`         |
| 401    | `{ "error": "Access denied. No token provided." }`    |
| 500    | `{ "error": "Internal server error" }`                |

---

#### `PUT /api/application/student-status`
**Access Level**: `student`, `admin`

**Description**: Update application status (Accept/Reject offer). If accepted, **all other pending applications are auto-rejected.**

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "profileCode": "string (required)",
  "status": "Accepted | Rejected (required)",
  "entryNumber": "string (optional, admin only - to update on behalf of student)"
}
```

**Response (Success)**:
```json
{
  "profile_code": "string",
  "entry_number": "string",
  "status": "Accepted | Rejected"
}
```

**Response (Error)**:
| Status | Response                                               |
|--------|--------------------------------------------------------|
| 400    | `{ "error": "Profile code and status are required" }`  |
| 400    | `{ "error": "Invalid status update" }`                 |
| 404    | `{ "error": "Application not found" }`                 |
| 500    | `{ "error": "Internal server error" }`                 |

---

#### `PUT /api/application/recruiter-status`
**Access Level**: `recruiter`, `admin`

**Description**: Update application status by recruiter (Select/Not Select candidate).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "profileCode": "string (required)",
  "entryNumber": "string (required)",
  "status": "Selected | Not Selected (required)"
}
```

**Response (Success)**:
```json
{
  "profile_code": "string",
  "entry_number": "string",
  "status": "Selected | Not Selected"
}
```

**Response (Error)**:
| Status | Response                                                                  |
|--------|---------------------------------------------------------------------------|
| 400    | `{ "error": "Profile code, entry number, and status are required" }`     |
| 400    | `{ "error": "Invalid status update by recruiter" }`                       |
| 403    | `{ "error": "Unauthorized: You can only update applications for your own profiles" }` |
| 404    | `{ "error": "Profile not found" }`                                        |
| 404    | `{ "error": "Application not found" }`                                    |
| 500    | `{ "error": "Internal server error" }`                                    |

---

### 4. Profile Endpoints

#### `GET /api/profiles/all`
**Access Level**: `student`, `admin`

**Description**: Get all job profiles.

**Headers**: `Authorization: Bearer <token>`

**Request**: None

**Response (Success)**:
```json
[
  {
    "profile_code": "string",
    "company_name": "string",
    "designation": "string",
    "recruiter_email": "string"
  }
]
```

---

#### `POST /api/profiles`
**Access Level**: `student`, `admin`

**Description**: Get profiles by specific profile codes.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "profileCodes": ["string", "string"] // array of profile codes (required)
}
```

**Response (Success)**:
```json
[
  {
    "profile_code": "string",
    "company_name": "string",
    "designation": "string",
    "recruiter_email": "string"
  }
]
```

**Response (Error)**:
| Status | Response                                           |
|--------|----------------------------------------------------|
| 400    | `{ "error": "List of profile codes is required" }` |
| 500    | `{ "error": "Internal server error" }`             |

---

#### `GET /api/profiles/recruiter-data`
**Access Level**: `recruiter`, `admin`

**Description**: Get all profiles and applications for the authenticated recruiter.

**Headers**: `Authorization: Bearer <token>`

**Request**: None

**Response (Success)**:
```json
[
  {
    "profile_code": "string",
    "company_name": "string",
    "designation": "string",
    "entry_number": "string | null",
    "status": "Applied | Selected | Not Selected | Accepted | Rejected | null"
  }
]
```

---

#### `POST /api/profiles/create-profile`
**Access Level**: `recruiter`, `admin`

**Description**: Create a new job profile.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "companyName": "string (required)",
  "designation": "string (required)",
  "recruiterEmail": "string (optional, admin only - to create on behalf of recruiter)"
}
```

**Response (Success)**:
```json
{
  "profile_code": "string",
  "company_name": "string",
  "designation": "string",
  "recruiter_email": "string"
}
```

**Response (Error)**:
| Status | Response                                                   |
|--------|------------------------------------------------------------|
| 400    | `{ "error": "Company name and designation are required" }` |
| 500    | `{ "error": "Internal server error" }`                     |

---

#### `DELETE /api/profiles/delete-profile`
**Access Level**: `recruiter`, `admin`

**Description**: Delete a job profile (recruiters can only delete their own profiles).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "profileCode": "string (required)"
}
```

**Response (Success)**:
```json
{
  "message": "Profile deleted successfully"
}
```

**Response (Error)**:
| Status | Response                                                          |
|--------|-------------------------------------------------------------------|
| 400    | `{ "error": "Profile code is required" }`                         |
| 403    | `{ "error": "Unauthorized: You can only delete your own profiles" }` |
| 404    | `{ "error": "Profile not found" }`                                |
| 500    | `{ "error": "Internal server error" }`                            |

---

### 5. Admin Endpoints

#### `GET /api/admin/students`
**Access Level**: `admin`

**Description**: Get all students.

**Headers**: `Authorization: Bearer <token>`

**Request**: None

**Response (Success)**:
```json
[
  {
    "userid": "string"
  }
]
```

---

#### `GET /api/admin/recruiters`
**Access Level**: `admin`

**Description**: Get all recruiters.

**Headers**: `Authorization: Bearer <token>`

**Request**: None

**Response (Success)**:
```json
[
  {
    "userid": "string"
  }
]
```

---

#### `GET /api/admin/student/:userId`
**Access Level**: `admin`

**Description**: Get all applications for a specific student.

**Headers**: `Authorization: Bearer <token>`

**URL Parameters**:
| Parameter | Type   | Description           |
|-----------|--------|-----------------------|
| userId    | string | Student's entry number |

**Response (Success)**:
```json
[
  {
    "profile_code": "string",
    "status": "Applied | Selected | Not Selected | Accepted | Rejected"
  }
]
```

---

#### `GET /api/admin/recruiter/:userId`
**Access Level**: `admin`

**Description**: Get all profiles and applications for a specific recruiter.

**Headers**: `Authorization: Bearer <token>`

**URL Parameters**:
| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| userId    | string | Recruiter's email/userId |

**Response (Success)**:
```json
[
  {
    "profile_code": "string",
    "company_name": "string",
    "designation": "string",
    "entry_number": "string | null",
    "status": "Applied | Selected | Not Selected | Accepted | Rejected | null"
  }
]
```

---

## Common Error Responses

All protected endpoints may return:

| Status | Response                                                |
|--------|---------------------------------------------------------|
| 401    | `{ "error": "Access denied. No token provided." }`     |
| 403    | `{ "error": "Invalid token." }`                         |
| 403    | `{ "error": "Access denied. No role found." }`          |
| 403    | `{ "error": "Access denied. Insufficient permissions." }` |
| 500    | `{ "error": "Internal server error" }`                  |

---

## API Summary Table

| Method | Endpoint                         | Access Level        | Description                          |
|--------|----------------------------------|---------------------|--------------------------------------|
| GET    | `/`                              | Public              | Health check                         |
| GET    | `/test-db`                       | Public              | Test DB connection                   |
| POST   | `/api/login`                     | Public              | User login                           |
| GET    | `/api/application`               | Student, Admin      | Get user's applications              |
| POST   | `/api/application`               | Student, Admin      | Apply for a job                      |
| PUT    | `/api/application/student-status`| Student, Admin      | Accept/Reject offer                  |
| PUT    | `/api/application/recruiter-status`| Recruiter, Admin | Select/Reject candidate              |
| GET    | `/api/profiles/all`              | Student, Admin      | Get all profiles                     |
| POST   | `/api/profiles`                  | Student, Admin      | Get profiles by codes                |
| GET    | `/api/profiles/recruiter-data`   | Recruiter, Admin    | Get recruiter's profiles & applications |
| POST   | `/api/profiles/create-profile`   | Recruiter, Admin    | Create new profile                   |
| DELETE | `/api/profiles/delete-profile`   | Recruiter, Admin    | Delete profile                       |
| GET    | `/api/admin/students`            | Admin               | Get all students                     |
| GET    | `/api/admin/recruiters`          | Admin               | Get all recruiters                   |
| GET    | `/api/admin/student/:userId`     | Admin               | Get student's applications           |
| GET    | `/api/admin/recruiter/:userId`   | Admin               | Get recruiter's data                 |

## TODO
- currently status changes are irreversible, i.e. once a student accepts/rejects an offer, they cannot change their mind. Similarly, once a recruiter selects/rejects a candidate, they cannot change their mind. This needs to be fixed.
- admin should be able to add/remove students and recruiters. 
- give a profiles and applications tab to the admin dashboard so that admin can view all profiles and applications instead of having to go and view them student/recruiter wise.
- Add detial to the users table so that we have something to display as MY INFO (currently its just the user_id that we have)