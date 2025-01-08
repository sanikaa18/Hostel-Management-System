CREATE DATABASE hostel_management;

USE hostel_management;

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(100) UNIQUE NOT NULL,
    student_password VARCHAR(255) NOT NULL,
    student_department VARCHAR(100) NOT NULL,
    student_year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE hostel_rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    capacity INT NOT NULL,
    hostel_block VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE hostel_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(room_id)
);


CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE admin_access_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    login_time DATETIME NOT NULL,
    logout_time DATETIME,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(admin_id)
);



-- Insert Administrators into the admin Table
INSERT INTO admin (username, password, email) VALUES
('admin1', 'admin123', 'admin1@example.com'),
('admin2', 'admin456', 'admin2@example.com');

-- Insert Students into the students Table
INSERT INTO students (student_name, student_email, student_password, student_department, student_year) VALUES
('dipak', 'dipak@example.com', 'pass@123', 'Computer Science', 1),
('aditya', 'aditya@example.com', 'pass@456', 'IT', 2);

INSERT INTO students (student_name, student_email, student_password, student_department, student_year) VALUES
('sanika', 'sanika@example.com', 'pass@123', 'Computer Science', 1),
('shruti', 'shruti@example.com', 'pass@456', 'IT', 2);

INSERT INTO students (student_name, student_email, student_password, student_department, student_year) VALUES
('tanaya', 'tanaya@example.com', 'pass@123', 'ME', 1),
('sayali', 'sayali@example.com', 'pass@123', 'EE', 2);

-- Insert Courses into the courses Table
INSERT INTO courses (course_name, course_description) VALUES
('Computer Science', 'Introduction to Computer Science'),
('Electrical Engineering', 'Circuit Analysis and Design');

-- Insert Hostel Rooms into the hostel_rooms Table
INSERT INTO hostel_rooms (room_number, capacity, hostel_block) VALUES
('101', 2, 'A'),
('102', 4, 'B');

-- Insert Hostel Rooms into the hostel_rooms Table
INSERT INTO hostel_rooms (room_number, capacity, hostel_block) VALUES
('103', 2, 'A'),
('104', 2, 'B');
-- Select Administrators from the admin Table
SELECT * FROM admin;

-- Select Students from the students Table
SELECT * FROM students;

-- Select Courses from the courses Table
SELECT * FROM courses;

-- Select Hostel Rooms from the hostel_rooms Table
SELECT * FROM hostel_rooms;


ALTER TABLE students
ADD COLUMN room_id INT,
ADD FOREIGN KEY (room_id) REFERENCES hostel_rooms(room_id);


UPDATE students SET room_id = 1 WHERE student_id = 1;




ALTER TABLE hostel_rooms
ADD COLUMN allotted BOOLEAN DEFAULT FALSE;




CREATE TABLE provisional_application (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    sgpa DECIMAL(4, 2) NOT NULL,
    hostel_preference VARCHAR(1) NOT NULL,
    photo VARCHAR(255),
    status ENUM('pending', 'rejected', 'approved') DEFAULT 'pending', -- Added status column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


SELECT * FROM provisional_application;


DELETE FROM students WHERE student_email="aditya@example.com";