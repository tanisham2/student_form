const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static("uploads"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "student_form"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed", err);
    } 
    else {
        console.log("Connected to MySQL");
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /pdf/;

    const extname = allowedFileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mimetype = file.mimetype === "application/pdf";

    if (extname && mimetype) {
        cb(null, true);
    } 
    else {
        cb(new Error("Only PDF files are allowed"));
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter
});

app.post("/submit", (req, res) => {

    upload.single("resume")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                  return res.send("File size exceeds 2MB");
            }
            return res.send(err.message);
        }
            else if (err) {
                return res.send(err.message);
        }

    console.log("Body received:", req.body);
    console.log("File received:", req.file);

    const { name, email, phone, gender, courses } = req.body;

    const filePath = req.file ? req.file.filename : null;
    const coursesString = Array.isArray(courses) ? courses.join(", ") : courses;

    const sql = 
      `INSERT INTO students 
      (name, email, phone, gender, courses, resume) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    

    db.query(
        sql, 
        [name, email, phone, gender, coursesString, filePath], 
        (err) => {
          if (err) {
            console.log(err);
            res.send("Error inserting data");
        } 
        else {
            res.send("Data inserted successfully");
        }
    });
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
