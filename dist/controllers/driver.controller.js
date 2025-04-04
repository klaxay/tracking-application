"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleDriverStatus = exports.getAvailableDrivers = exports.getDriverLocation = exports.updateDriverLocation = exports.registerDriver = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const axios_1 = __importDefault(require("axios"));
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
// 📌 Register a new driver
const registerDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, vehicleNumber, location } = req.body;
    if (!name || !phone || !vehicleNumber || !(location === null || location === void 0 ? void 0 : location.latitude) || !(location === null || location === void 0 ? void 0 : location.longitude)) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    try {
        const existingDriver = yield driver_model_1.default.findOne({ phone });
        if (existingDriver) {
            res.status(400).json({ message: "Driver with this phone already exists" });
            return;
        }
        const newDriver = new driver_model_1.default({
            name,
            phone,
            vehicleNumber,
            location,
            isAvailable: true,
        });
        yield newDriver.save();
        res.status(201).json(newDriver);
    }
    catch (error) {
        res.status(500).json({ message: "Error registering driver", error: error.message });
    }
});
exports.registerDriver = registerDriver;
const getCurrentDriverLocation = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${API_KEY}`, {});
    return response.data.location; // Contains latitude and longitude
});
// 📌 Update driver location
const updateDriverLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId } = req.params;
    try {
        // Get the driver's current location using Google Maps Geolocation API
        const { lat, lng } = yield getCurrentDriverLocation();
        // Find the driver and update their location
        const updatedDriver = yield driver_model_1.default.findByIdAndUpdate(driverId, { $set: { location: { latitude: lat, longitude: lng }, updatedAt: Date.now() } }, { new: true });
        if (!updatedDriver) {
            res.status(404).json({ message: "Driver not found" });
            return;
        }
        res.status(200).json(updatedDriver);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating driver location", error: error.message });
    }
});
exports.updateDriverLocation = updateDriverLocation;
// 📌 Get driver location
const getDriverLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(driverId)) {
        res.status(400).json({ message: "Invalid driver ID" });
        return;
    }
    try {
        const driver = yield driver_model_1.default.findById(driverId, "location");
        if (!driver) {
            res.status(404).json({ message: "Driver not found" });
            return;
        }
        res.status(200).json(driver.location);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching driver location", error: error.message });
    }
});
exports.getDriverLocation = getDriverLocation;
// 📌 Get all available drivers
const getAvailableDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const availableDrivers = yield driver_model_1.default.find({ isAvailable: true }, "name phone location");
        if (availableDrivers.length === 0) {
            res.status(404).json({ message: "No available drivers found" });
            return;
        }
        res.status(200).json(availableDrivers);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching available drivers", error: error.message });
    }
});
exports.getAvailableDrivers = getAvailableDrivers;
const toggleDriverStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId } = req.params;
    const { online } = req.body;
    if (typeof online !== "boolean") {
        res.status(400).json({ message: "Online status must be a boolean" });
    }
    try {
        const driver = yield driver_model_1.default.findByIdAndUpdate(driverId, { online }, { new: true });
        if (!driver) {
            res.status(404).json({ message: "Driver not found" });
        }
        res.status(200).json({
            message: `Driver status updated to ${online ? "online" : "offline"}`,
            driver,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating driver status", error });
    }
});
exports.toggleDriverStatus = toggleDriverStatus;
