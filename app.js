const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const connection = require('./connectdb');
const session = require('express-session');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.set("view engine", "ejs");

app.use(session({ 
    secret: 'your-secret-key', // Specify a secret key for session encryption
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/admin", (req, res) => {
    connection.query('SELECT * FROM admin', (err, rows) => {
        if (err) throw err;
        res.render('admin', { admin: rows });
    });
});

app.get("/admin/login", (req, res) => {
    res.render("admin_login");
});


app.get("/student/login", (req, res) => {
    res.render("student_login_n");
});


// Student Login Route
app.post("/student/login", (req, res) => {
    const { email, password } = req.body;
    
    // Query the database to check if the student exists and the password is correct
    const sql = "SELECT * FROM students WHERE student_email = ? AND student_password = ?";
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            res.status(500).send("Internal server error");
        } else {
            if (results.length > 0) {
                // If a student with the provided email and password exists
                req.session.studentLoggedIn = true; // Set session variable
                req.session.email = email; 
                // res.send("student credentials");
                res.redirect("/student/dashboard"); // Redirect to student dashboard
            } else {
                // If no student with the provided email and password is found
                res.send("Invalid student credentials"); // Handle invalid credentials
            }
        }
    });
});



app.get("/student/dashboard", (req, res) => {
    // Check if the student is logged in
    if (req.session.studentLoggedIn) {
        // Retrieve the logged-in student's details from the database
        const email = req.session.email; // Assuming you store student's email in session
        const sqlStudent = "SELECT * FROM students WHERE student_email = ?";
        const sqlFormStatus = "SELECT status FROM provisional_application WHERE email = ?";
        
        connection.query(sqlStudent, [email], (errStudent, resultsStudent) => {
            if (errStudent) {
                res.status(500).send("Internal server error");
                return;
            }

            if (resultsStudent.length > 0) {
                const student = resultsStudent[0];
                
                // Fetch the hostel registration form status
                connection.query(sqlFormStatus, [email], (errFormStatus, resultsFormStatus) => {
                    if (errFormStatus) {
                        res.status(500).send("Internal server error");
                        return;
                    }

                    const formStatus = resultsFormStatus.length > 0 ? resultsFormStatus[0].status : "Not submitted";
                    
                    // Render the student dashboard and pass student details and form status to the template
                    res.render("student_dashboard", { student: student, applicationStatus: formStatus });
                });
            } else {
                res.send("Student details not found");
            }
        });
    } else {
        res.redirect("/student/login"); // Redirect to login if student is not logged in
    }
});


// Route to handle admin login
app.post("/admin/login", (req, res) => {
    const { username, password } = req.body;
   
    // Query the database to check if the admin exists and the password is correct
    const sql = "SELECT * FROM admin WHERE username = ? AND password = ?";
    connection.query(sql, [username, password], (err, results) => {
        if (err) {
            res.status(500).send("Internal server error");
        } else {
            if (results.length > 0) {
                // If an admin with the provided username and password exists
                req.session.adminLoggedIn = true; // Set session variable
                req.session.username = username; // Store admin's username in session
                res.redirect("/admin/dashboard"); // Redirect to admin dashboard
            } else {
                // If no admin with the provided username and password is found
                res.send("Invalid admin credentials"); // Handle invalid credentials
            }
        }
    });
});

// Route to render the admin dashboard
app.get("/admin/dashboard", (req, res) => {
    
    // Check if the admin is logged in
    if (req.session.adminLoggedIn) {
        // Retrieve the logged-in admin's username from the session
        const username = req.session.username;

        // Query the database to retrieve the admin's details
        const sql = "SELECT * FROM admin WHERE username = ?";
        connection.query(sql, [username], (err, results) => {
            if (err) {
                res.status(500).send("Internal server error");
            } else {
                if (results.length > 0) {
                    const admin = results[0];
                    // Render the admin dashboard and pass admin details to the template
                    res.render("admin_dashboard", { admin: admin });
                } else {
                    res.send("Admin details not found");
                }
            }
        });
    } else {
        res.redirect("/admin/login"); // Redirect to login if admin is not logged in
    }
});





app.get("/students", (req, res) => {
    connection.query('SELECT * FROM students', (err, rows) => {
        if (err) throw err;
        res.render('students', { students: rows });
    });
});

// Route to render the courses data
app.get("/courses", (req, res) => {
    connection.query('SELECT * FROM courses', (err, rows) => {
        if (err) throw err;
        res.render('courses', { courses: rows });
    });
});

// Route to render the hostel rooms data
app.get("/hostel_rooms", (req, res) => {
    connection.query('SELECT * FROM hostel_rooms', (err, rows) => {
        if (err) throw err;
        res.render('hostel_rooms', { hostelRooms: rows });
    });
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}/`);
});


// Backend endpoint to fetch student data
app.get("/api/students", (req, res) => {
    // Fetch student data from the database
    connection.query('SELECT * FROM students', (err, rows) => {
        if (err) {
            console.error("Error fetching student data:", err);
            res.status(500).json({ error: "Failed to fetch student data" });
            return;
        }

        // Send the fetched student data as a response
        res.json(rows);
    });
});


// Backend endpoint to fetch room details
app.get("/api/rooms", (req, res) => {
    // Fetch room data from the database
    connection.query('SELECT * FROM hostel_rooms', (err, rows) => {
        if (err) {
            console.error("Error fetching room data:", err);
            res.status(500).json({ error: "Failed to fetch room data" });
            return;
        }

        // Send the fetched room data as a response
        res.json(rows);
    });
});

app.post("/api/allocate-room", (req, res) => {
    // Get student ID and room ID from the request body
    const { studentId, roomId } = req.body;
    console.log(req.body);
    // Update the database to allocate the room to the student
    connection.query('UPDATE students SET room_id = ? WHERE student_id = ?', [roomId, studentId], (err, result) => {
        if (err) {
            console.error("Error allocating room:", err);
            res.status(500).json({ error: "Failed to allocate room" });
            return;
        }
        connection.query(
            'UPDATE hostel_rooms SET allotted = ? WHERE room_id = ?',
            [true, roomId],
            (err, result) => {
                if (err) {
                    console.error("Error updating room status:", err);
                    res.status(500).json({ error: "Failed to update room status" });
                    return;
                }})

        // Room allocated successfully
        res.json({ message: "Room allocated successfully" });
    });
});
app.post('/hostel-registration', upload.single('photo'), (req, res) => {
    // Check if the student has already submitted the form
    const email = req.session.email; // Assuming you store student's email in session
    const sqlCheck = "SELECT status FROM provisional_application WHERE email = ?";
    connection.query(sqlCheck, [email], (err, results) => {
        if (err) {
            console.error("Error checking form submission status:", err);
            res.status(500).send("Internal server error");
            return;
        }
        if (results.length > 0) {
            // If form already submitted, redirect to student dashboard
            res.redirect('/student/dashboard');
            return;
        }
        // If form not submitted yet, proceed with form submission logic
        const { name, email, department, year, sgpa } = req.body;
        const photoPath = req.file ? req.file.path : null;
        const sqlInsert = `
            INSERT INTO provisional_application (name, email, department, year, sgpa, hostel_preference, photo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [name, email, department, year, sgpa, req.body.hostelpreference, photoPath];
        connection.query(sqlInsert, values, (err, result) => {
            if (err) {
                console.error('Error submitting form:', err);
                res.status(500).send('Internal server error');
                return;
            }
            console.log('Form submitted successfully');
            res.redirect('/student/dashboard');
        });
    });
});

app.get("/api/provisional-applications", (req, res) => {
    // Assuming you have a database table named 'provisional_applications' containing application data

    // Query the database to retrieve provisional application data
    const sql = "SELECT * FROM provisional_application";
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching provisional applications:", err);
            res.status(500).json({ error: "Internal server error" });
        } else {
            // Send the fetched application data as a JSON response
            res.json(results);
        }
    });
});


// Assuming you have already defined your Express app and have access to the necessary middleware and database connection

// Route to approve a provisional application
// app.post("/api/provisional-applications/:id/approve", (req, res) => {
//     // Extract the application ID from the request parameters
//     const applicationId = req.params.id;
//     console.log(applicationId);
//     // Fetch the provisional application details from the database
//     const selectSql = "SELECT * FROM provisional_application WHERE application_id = ?";
//     connection.query(selectSql, [applicationId], (selectErr, selectResults) => {
//         if (selectErr) {
//             console.error("Error fetching provisional application details:", selectErr);
//             res.status(500).json({ error: "Failed to fetch provisional application details." });
//         } else {
//             if (selectResults.length === 0) {
//                 res.status(404).json({ error: "Provisional application not found." });
//             } else {
//                 // Extract student details from the provisional application
//                 const provisionalApplication = selectSql[0];
//                 const student_name = selectSql[1];
//                 const student_email = selectSql[2];
//                 const student_department = selectSql[3];
//                 const student_year = selectSql[4];
//                 // const { student_name, student_email, student_department, student_year } = provisionalApplication;
//                 console.log(student_name)
//                 // Insert the student data into the students table
//                 const insertSql = "INSERT INTO students (student_name, student_email, student_department, student_year) VALUES (?, ?, ?, ?)";
//                 connection.query(insertSql, [student_name, student_email, student_department, student_year], (insertErr, insertResults) => {
//                     if (insertErr) {
//                         console.error("Error inserting student data:", insertErr);
//                         res.status(500).json({ error: "Failed to insert student data." });
//                     } else {
//                         // Update the status of the application in the database to "approved"
//                         const updateSql = "UPDATE provisional_application SET status = 'approved' WHERE application_id = ?";
//                         connection.query(updateSql, [applicationId], (updateErr, updateResults) => {
//                             if (updateErr) {
//                                 console.error("Error updating application status:", updateErr);
//                                 res.status(500).json({ error: "Failed to update application status." });
//                             } else {
//                                 // Application approved and student inserted successfully
//                                 res.json({ message: "Application approved and student inserted successfully." });
//                             }
//                         });
//                     }
//                 });
//             }
//         }
//     });
// });
app.post("/api/provisional-applications/:id/approve", (req, res) => {
    const applicationId = req.params.id;

    // Fetch provisional application details from the database
    const selectSql = "SELECT * FROM provisional_application WHERE application_id = ?";
    connection.query(selectSql, [applicationId], (selectErr, selectResults) => {
        if (selectErr) {
            console.error("Error fetching provisional application details:", selectErr);
            res.status(500).json({ error: "Failed to fetch provisional application details." });
            return;
        }

        if (selectResults.length === 0) {
            res.status(404).json({ error: "Provisional application not found." });
        } else {
            const provisionalApplication = selectResults[0];
            console.log("Fetched application details:", provisionalApplication);

            // Extract details to insert into approved_provisional_applications
            const { name: student_name, email: student_email, department: student_department, year: student_year } = provisionalApplication;

            const insertSql = `
                INSERT INTO approved_provisional_applications (student_name, student_email, student_department, student_year)
                VALUES (?, ?, ?, ?)
            `;
            connection.query(insertSql, [student_name, student_email, student_department, student_year], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error("Error inserting approved application data:", insertErr);
                    res.status(500).json({ error: "Failed to insert approved application data." });
                } else {
                    // Update status of the original application to 'approved'
                    const updateSql = "UPDATE provisional_application SET status = 'approved' WHERE application_id = ?";
                    connection.query(updateSql, [applicationId], (updateErr, updateResults) => {
                        if (updateErr) {
                            console.error("Error updating application status:", updateErr);
                            res.status(500).json({ error: "Failed to update application status." });
                        } else {
                            res.json({ message: "Application approved and data inserted into approved_provisional_applications." });
                        }
                    });
                }
            });
        }
    });
});




// Assuming you have already defined your Express app and have access to the necessary middleware and database connection

// app.post("/api/provisional-applications/:id/reject", (req, res) => {
//     // Extract the application ID from the request parameters
//     const applicationId = req.params.id;

//     // Update the status of the application in the database to "rejected"
//     const updateSql = "UPDATE provisional_application SET status = 'rejected' WHERE application_id = ?";
//     connection.query(updateSql, [applicationId], (updateErr, updateResults) => {
//         if (updateErr) {
//             console.error("Error rejecting application:", updateErr);
//             res.status(500).json({ error: "Failed to reject application." });
//         } else {
//             // Delete the corresponding student record from the students table
//             const deleteSql = "DELETE FROM students WHERE student_email IN (SELECT student_email FROM provisional_application WHERE application_id = ?)";
//             connection.query(deleteSql, [applicationId], (deleteErr, deleteResults) => {
//                 if (deleteErr) {
//                     console.error("Error deleting student record:", deleteErr);
//                     res.status(500).json({ error: "Failed to delete student record." });
//                 } else {
//                     // Application rejected and corresponding student record deleted successfully
//                     res.json({ message: "Application rejected and student record deleted successfully." });
//                 }
//             });
//         }
//     });
// });

app.post("/api/provisional-applications/:id/reject", (req, res) => {
    // Extract the application ID from the request parameters
    const applicationId = req.params.id;

    // Update the status of the application in the database to "rejected"
    const updateSql = "UPDATE provisional_application SET status = 'rejected' WHERE application_id = ?";
    connection.query(updateSql, [applicationId], (updateErr, updateResults) => {
        if (updateErr) {
            console.error("Error rejecting application:", updateErr);
            res.status(500).json({ error: "Failed to reject application." });
        } else {
            // Delete the corresponding record from approved_provisional_applications table
            const deleteSql = "DELETE FROM approved_provisional_applications WHERE student_email IN (SELECT email FROM provisional_application WHERE application_id = ?)";
            connection.query(deleteSql, [applicationId], (deleteErr, deleteResults) => {
                if (deleteErr) {
                    console.error("Error deleting approved application record:", deleteErr);
                    res.status(500).json({ error: "Failed to delete approved application record." });
                } else {
                    // Application rejected and corresponding record deleted successfully
                    res.json({ message: "Application rejected and approved application record deleted successfully." });
                }
            });
        }
    });
});
