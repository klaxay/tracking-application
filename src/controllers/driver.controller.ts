 import mongoose from "mongoose";
import { Request, Response } from "express";
import Driver from "../models/driver.model";
import axios from "axios";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Define location type
interface Location {
  latitude: number;
  longitude: number;
}

// 📌 Register a new driver
export const registerDriver = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, vehicleNumber, location } = req.body;

  if (!name || !phone || !vehicleNumber || !location?.latitude || !location?.longitude) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const existingDriver = await Driver.findOne({ phone });
    if (existingDriver) {
      res.status(400).json({ message: "Driver with this phone already exists" });
      return;
    }

    const newDriver = new Driver({
      name,
      phone,
      vehicleNumber,
      location,
      isAvailable: true,
    });

    await newDriver.save();
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(500).json({ message: "Error registering driver", error: (error as Error).message });
  }
};

const getCurrentDriverLocation = async () => {
  const response = await axios.post(
    `https://www.googleapis.com/geolocation/v1/geolocate?key=${API_KEY}`,
    {}
  );
  return response.data.location; // Contains latitude and longitude
};

// 📌 Update driver location
export const updateDriverLocation = async (req: Request, res: Response): Promise<void> => {
  const { driverId } = req.params;

  try {
    // Get the driver's current location using Google Maps Geolocation API
    const { lat, lng } = await getCurrentDriverLocation();

    // Find the driver and update their location
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { $set: { location: { latitude: lat, longitude: lng }, updatedAt: Date.now() } },
      { new: true }
    );

    if (!updatedDriver) {
      res.status(404).json({ message: "Driver not found" });
      return;
    }

    res.status(200).json(updatedDriver);
  } catch (error : unknown) {
    res.status(500).json({ message: "Error updating driver location", error: (error as Error).message });
  }
};

// 📌 Get driver location
export const getDriverLocation = async (req: Request, res: Response): Promise<void> => {
  const { driverId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    res.status(400).json({ message: "Invalid driver ID" });
    return;
  }

  try {
    const driver = await Driver.findById(driverId, "location");

    if (!driver) {
      res.status(404).json({ message: "Driver not found" });
      return;
    }

    res.status(200).json(driver.location);
  } catch (error) {
    res.status(500).json({ message: "Error fetching driver location", error: (error as Error).message });
  }
};

// 📌 Get all available drivers
export const getAvailableDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const availableDrivers = await Driver.find({ isAvailable: true }, "name phone location");

    if (availableDrivers.length === 0) {
      res.status(404).json({ message: "No available drivers found" });
      return;
    }

    res.status(200).json(availableDrivers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available drivers", error: (error as Error).message });
  }
};

export const toggleDriverStatus = async (req: Request, res: Response): Promise<void> => {
  const { driverId } = req.params;
  const { online } = req.body;

  if (typeof online !== "boolean") {
    res.status(400).json({ message: "Online status must be a boolean" });
  }

  try {
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { online },
      { new: true }
    );

    if (!driver) {
      res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({
      message: `Driver status updated to ${online ? "online" : "offline"}`,
      driver,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating driver status", error });
  }
};
