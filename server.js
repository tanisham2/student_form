const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static("uploads"));

mongoose.connect("mongodb://localhost:27017/student_form")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection failed:", err));

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    gender: String,
    courses: [String],
    resume: String
});

const Student = mongoose.model("Student", studentSchema);

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
    upload.single("resume") (req, res, async (err) => {
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

        try {
            const newStudent = new Student({
                name,
                email,
                phone,
                gender,
                courses: Array.isArray(courses)
                    ? courses
                    : [courses],

                resume: req.file
                    ? req.file.filename
                    : null
            });

            await newStudent.save();
            console.log("Inserted successfully");
            res.send("Data inserted successfully");
        } 
        catch(err) {
            console.log(err);
            res.send("Error inserting data");
        }
    });

});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
