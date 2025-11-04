import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "qismat_uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });
export default upload;
import upload from "./upload.js";

app.post("/api/registerDonation", upload.single("screenshot"), async (req, res) => {
  try {
    const { name, phone, userType, institutionName, municipality, wardNumber, quantity } = req.body;
    const imageUrl = req.file?.path; // Cloudinary gives a public URL

    const newDonation = new Registration({
      name,
      phone,
      userType,
      institutionName,
      municipality,
      wardNumber,
      quantity,
      screenshot: imageUrl,
    });

    await newDonation.save();
    res.status(200).json({ message: "Donation registered successfully", donation: newDonation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving donation data" });
  }
});

