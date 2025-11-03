import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ["student", "other"], required: true },
  institutionName: { type: String },
  municipality: { type: String },
  wardNumber: { type: String },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  screenshot: { type: String }, // path to uploaded file
  createdAt: { type: Date, default: Date.now },
});

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
