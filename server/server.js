import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import Registration from "./models/registration.js";

// ✅ Connect MongoDB
mongoose
  .connect("mongodb+srv://shegil:Sh*9847697881@cluster0.rdefwju.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads directory:", uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Make uploads public
app.use("/uploads", express.static(uploadDir));


/* ------------------------------------
   📌  Routes
------------------------------------ */

// 🧾 Save donation registration (with screenshot)
app.post("/api/registerDonation", upload.single("screenshot"), async (req, res) => {
  try {
    const {
      name,
      phone,
      userType,
      institutionName,
      municipality,
      wardNumber,
      quantity,
    } = req.body;

    const totalAmount = parseInt(quantity) * 199;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newDonation = new Registration({
      name,
      phone,
      userType,
      institutionName,
      municipality,
      wardNumber,
      quantity,
      totalAmount,
      screenshot: filePath,
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

// 📋 Get all registrations (Admin Dashboard)
app.get("/registrations", async (req, res) => {
  try {
    const data = await Registration.find().sort({ date: -1 });
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// 🧩 Basic Register Route (fallback)
app.post("/register", async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving registration:", err);
    res.status(500).json({ error: "Failed to save registration" });
  }
});
// 🗑️ Delete registration by ID
app.delete("/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Registration.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting registration:", error);
    res.status(500).json({ message: "Failed to delete record" });
  }
});

app.use(cors({
  origin: "http://localhost:5173", // or your frontend URL
  methods: ["GET", "POST", "DELETE", "PUT"],
}));


// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

