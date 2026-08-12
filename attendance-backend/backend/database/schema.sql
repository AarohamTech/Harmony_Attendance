-- Employee Face Recognition Attendance System Schema
-- Supabase PostgreSQL

DROP TABLE IF EXISTS login_sessions CASCADE;
DROP TABLE IF EXISTS manager_actions CASCADE;
DROP TABLE IF EXISTS managers CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS attendance_requests CASCADE;
DROP TABLE IF EXISTS face_registrations CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS attendance_days CASCADE;
DROP TABLE IF EXISTS punch_records CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS office_locations CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;

-- 1. office_locations
CREATE TABLE office_locations (
    office_id SERIAL PRIMARY KEY,
    office_name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    allowed_radius INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. employees
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) DEFAULT 'Engineering',
    designation VARCHAR(100) DEFAULT 'Employee',
    profile_photo TEXT,
    office_id INTEGER REFERENCES office_locations(office_id) ON DELETE SET NULL,
    shift_start TIME DEFAULT '09:00:00',
    shift_end TIME DEFAULT '18:00:00',
    grace_time TIME DEFAULT '09:15:00',
    weekly_off VARCHAR(20) DEFAULT 'Monday',
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. face_registrations
CREATE TABLE face_registrations (
    face_id SERIAL PRIMARY KEY,
    employee_id INTEGER UNIQUE REFERENCES employees(employee_id) ON DELETE CASCADE,
    embedding TEXT NOT NULL,
    registered_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. attendance
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    attendance_day VARCHAR(20) NOT NULL,
    punch_in TIMESTAMP WITH TIME ZONE,
    punch_out TIMESTAMP WITH TIME ZONE,
    working_hours VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name VARCHAR(255),
    distance_from_office DOUBLE PRECISION,
    attendance_status VARCHAR(50) NOT NULL,
    late_reason TEXT,
    early_exit_reason TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_employee_date UNIQUE (employee_id, attendance_date)
);

-- 5. attendance_requests
CREATE TABLE attendance_requests (
    request_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL,
    request_date DATE NOT NULL,
    requested_time TIME,
    reason TEXT NOT NULL,
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'Pending',
    manager_remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. holidays
CREATE TABLE holidays (
    holiday_id SERIAL PRIMARY KEY,
    holiday_name VARCHAR(255) NOT NULL,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_type VARCHAR(50) DEFAULT 'National'
);

-- 8. managers
CREATE TABLE managers (
    manager_id SERIAL PRIMARY KEY,
    employee_id INTEGER UNIQUE REFERENCES employees(employee_id) ON DELETE CASCADE,
    manager_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50)
);

-- 9. manager_actions
CREATE TABLE manager_actions (
    action_id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES attendance_requests(request_id) ON DELETE CASCADE,
    manager_id INTEGER REFERENCES managers(manager_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    remarks TEXT,
    action_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. login_sessions
CREATE TABLE login_sessions (
    session_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    jwt_token TEXT NOT NULL,
    device_name VARCHAR(255),
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_requests_employee_id ON attendance_requests(employee_id);
CREATE INDEX idx_requests_status ON attendance_requests(status);
