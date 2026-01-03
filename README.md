# Dayflow HRMS

**Dayflow HRMS** is a lightweight yet powerful Human Resource Management System designed to digitize and streamline everyday HR workflows.
It supports role-based access, employee lifecycle management, attendance and leave workflows, payroll visibility, and internal ticketing — all in one unified platform.

---

## ✨ Key Features

### 👥 Role-Based Access Control

* Admin / HR / Employee user roles
* Secure authentication via JWT
* Restricted views & permissions by role

### 🧑‍💼 Employee Management

* Detailed employee profiles with:

  * personal information
  * job details
  * salary structure
  * emergency contacts
  * skills & certifications
* Profile edit permissions based on role

### ⏱ Attendance Tracking

* Daily Check-In / Check-Out tracking
* Status support:

  * Present
  * Absent
  * Half-Day
  * Leave
* Weekly & historical view
* Admin access to global records

### 🌴 Leave Management

* Apply for leave (Paid / Sick / Unpaid)
* Date-range selection
* Remarks & document upload
* Approval workflow for Admin/HR
* Real-time status updates

### 💰 Payroll Visibility

* Employee salary components (read-only)
* Admin-side salary structure management
* PF / HRA / tax breakdown support

### 🎫 Ticketing System

* Raise internal tickets for:

  * IT
  * HR
  * Payroll
* Track ticket lifecycle & resolution

### 🛡 Audit Logging

* Track key system actions
* Accountability & transparency

---

## 🏗 Tech Stack

**Backend** — Python + FastAPI
**Database** — PostgreSQL / SQLite (SQLAlchemy ORM)
**Auth** — JWT
**Frontend** — HTML5, CSS3, Vanilla JavaScript

Chosen for:
✔ Simplicity
✔ Performance
✔ Hackathon-friendly development
✔ Clean API design

---

## 🚀 Getting Started

### Backend Setup

1. Navigate to backend directory

```bash
cd backend
```

2. Create virtual environment

```bash
python -m venv venv
```

3. Activate environment
   Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

4. Install dependencies

```bash
pip install -r requirements.txt
```

5. Start the API server

```bash
uvicorn backend.main:app --reload
```

API base URL:

```
http://127.0.0.1:8000
```

---

### Frontend Setup

The frontend uses static HTML + JavaScript.

Option 1 — Open directly
Just open `index.html` or `dashboard.html` in your browser.

Option 2 — Run local server

```bash
python -m http.server 8080
```

Then visit:

```
http://localhost:8080
```

---

## 🗄 Database Schema Overview

### Users

Stores authentication details & roles.

| Column               | Type    | Description               |
| -------------------- | ------- | ------------------------- |
| id                   | Integer | Primary Key               |
| login_id             | String  | Unique Login ID           |
| email                | String  | Unique Email              |
| password_hash        | String  | Secure Password Hash      |
| role                 | Enum    | ADMIN / HR / EMPLOYEE     |
| must_change_password | Boolean | Password Reset Flag       |
| is_active            | Boolean | Account Status            |
| is_verified          | Boolean | Email Verification Status |

---

### Employees

Stores core HR profile data.

| Column                                | Type    | Description          |
| ------------------------------------- | ------- | -------------------- |
| id                                    | Integer | Primary Key          |
| user_id                               | Integer | FK → users           |
| created_by_id                         | Integer | FK (HR/Admin)        |
| employee_code                         | String  | Unique Employee Code |
| full_name                             | String  | Name                 |
| department                            | String  | Department           |
| job_title                             | String  | Role Title           |
| date_of_joining                       | Date    | DOJ                  |
| phone                                 | String  | Phone                |
| address                               | Text    | Address              |
| profile_picture_url                   | Text    | Profile Image        |
| gender / marital_status / nationality | String  | Personal Details     |
| personal_email                        | String  | Alternate Email      |
| emergency_contact_*                   | String  | Emergency Contact    |
| skills / certifications / interests   | Text    | Professional Details |

---

### Attendance Records

| Column      | Type     | Description                         |
| ----------- | -------- | ----------------------------------- |
| id          | Integer  | Primary Key                         |
| employee_id | Integer  | FK → employees                      |
| date        | Date     | Record Date                         |
| check_in    | DateTime | Check-In Time                       |
| check_out   | DateTime | Check-Out Time                      |
| status      | Enum     | PRESENT / ABSENT / HALF_DAY / LEAVE |

---

### Leave Requests

| Column         | Type    | Description                   |
| -------------- | ------- | ----------------------------- |
| id             | Integer | Primary Key                   |
| employee_id    | Integer | FK → employees                |
| leave_type     | Enum    | PAID / SICK / UNPAID          |
| start_date     | Date    | Start                         |
| end_date       | Date    | End                           |
| reason         | Text    | Remarks                       |
| attachment_url | Text    | Document Link                 |
| status         | Enum    | PENDING / APPROVED / REJECTED |
| reviewed_by    | Integer | FK → users                    |
| review_comment | Text    | Reviewer Notes                |

---

### Tickets

| Column         | Type    | Description                            |
| -------------- | ------- | -------------------------------------- |
| id             | Integer | Primary Key                            |
| employee_id    | Integer | FK → employees                         |
| category       | String  | IT / HR / Payroll                      |
| subject        | String  | Title                                  |
| description    | Text    | Details                                |
| status         | Enum    | OPEN / IN_PROGRESS / RESOLVED / CLOSED |
| resolution     | Text    | Resolution Notes                       |
| assigned_to_id | Integer | FK → users                             |

---

### Salary Structures

| Column                 | Type    | Description    |
| ---------------------- | ------- | -------------- |
| id                     | Integer | Primary Key    |
| employee_id            | Integer | FK → employees |
| wage                   | Numeric | Base Wage      |
| basic_percentage       | Numeric | % Basic        |
| hra_percentage         | Numeric | % HRA          |
| pf_employee_percentage | Numeric | Employee PF %  |
| pf_employer_percentage | Numeric | Employer PF %  |
| professional_tax       | Numeric | Tax            |
| basic_component        | Numeric | Derived        |
| hra_component          | Numeric | Derived        |
| standard_allowance     | Numeric | Allowance      |
| performance_bonus      | Numeric | Bonus          |
| leave_travel_allowance | Numeric | LTA            |
| fixed_allowance        | Numeric | Fixed Pay      |
| pf_employee_amount     | Numeric | Derived        |
| pf_employer_amount     | Numeric | Derived        |
| effective_from         | Date    | Effective Date |

---

### Audit Logs

| Column           | Type    | Description       |
| ---------------- | ------- | ----------------- |
| id               | Integer | Primary Key       |
| actor_user_id    | Integer | FK → users        |
| action           | String  | e.g., CREATE_USER |
| target_type      | String  | Entity Name       |
| target_public_id | String  | Entity ID         |
| details          | Text    | JSON Metadata     |

---

## 📌 Project Goals

Dayflow is built to:

✔ Simplify HR workflows
✔ Improve transparency
✔ Reduce manual effort
✔ Maintain clean UX
✔ Stay hackathon-friendly & modular

---

## 🔮 Planned Enhancements

* Email notifications
* Analytics dashboard
* Salary slips & reporting
* MFA authentication

---

