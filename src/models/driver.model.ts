import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true, unique: true },
  isAvailable: { type: Boolean, default: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  online: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;