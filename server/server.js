import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import Registration from "./models/registration.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose
  .connect("mongodb+srv://shegil:Sh*9847697881@cluster0.rdefwju.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected"))
  process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});


// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "qismat_donations", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});
const upload = multer({ storage });

// ✅ Save Donation Registration (with screenshot)
app.post("/api/registerDonation", upload.single("screenshot"), async (req, res) => {
  try {
    const { name, phone, userType, institutionName, municipality, wardNumber, quantity } = req.body;
    const totalAmount = parseInt(quantity) * 199;

    const newDonation = new Registration({
      name,
      phone,
      userType,
      institutionName,
      municipality,
      wardNumber,
      quantity,
      totalAmount,
      screenshot: req.file ? req.file.path : null, // Cloudinary returns the file URL here
    });

    await newDonation.save();

    res.status(201).json({
      success: true,
      message: "Donation registered successfully",
      donation: newDonation,
    });
  } catch (error) {
    console.error("❌ Error saving donation data:", error);
    res.status(500).json({ success: false, message: "Server error while saving donation" });
  }
});

// ✅ Get all registrations (Admin Dashboard)
app.get("/registrations", async (req, res) => {
  try {
    const data = await Registration.find().sort({ date: -1 });
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// ✅ Delete registration
app.delete("/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Registration.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting registration:", error);
    res.status(500).json({ message: "Failed to delete record" });
  }
});

// ✅ CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",                  // local dev
      "https://donate.qismatacademy.in",        // your custom domain (future)
      "https://donation-qismat-1.onrender.com", // your current frontend on Render
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);


// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


