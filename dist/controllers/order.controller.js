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
exports.getETA = exports.trackOrder = exports.updateOrderStatus = exports.getOrderById = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const axios_1 = __importDefault(require("axios"));
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const geocodeAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const url = "https://maps.googleapis.com/maps/api/geocode/json";
    const response = yield axios_1.default.get(url, {
        params: {
            address,
            key: process.env.GOOGLE_MAPS_API_KEY,
        },
    });
    const data = response.data;
    if (data.status !== "OK" || data.results.length === 0) {
        throw new Error("Failed to geocode address");
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
});
const calculateETAMinutes = (origin, destination) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const url = "https://maps.googleapis.com/maps/api/distancematrix/json";
    const response = yield axios_1.default.get(url, {
        params: {
            origins: origin,
            destinations: destination,
            key: process.env.GOOGLE_MAPS_API_KEY,
        },
    });
    const data = response.data;
    const element = (_a = data.rows[0]) === null || _a === void 0 ? void 0 : _a.elements[0];
    if (data.status !== "OK" ||
        !element ||
        element.status !== "OK") {
        throw new Error("Failed to calculate ETA");
    }
    const durationInSeconds = element.duration.value;
    const eta = new Date(Date.now() + durationInSeconds * 1000); // convert seconds to milliseconds
    return eta;
});
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, pickupAddress, deliveryAddress, pickupCoordinates, deliveryCoordinates, } = req.body;
        if (!customerId) {
            return res.status(400).json({ error: "Customer ID is required" });
        }
        // Check whether an order already exists
        const activeOrders = yield order_model_1.default.find({ customerId, status: { $ne: "delivered" } });
        if (activeOrders.length > 0) {
            return res.status(400).json({ error: "You already have an active order" });
        }
        // Determine coordinates
        const pickup = pickupCoordinates || (pickupAddress ? yield geocodeAddress(pickupAddress) : null);
        const delivery = deliveryCoordinates || (deliveryAddress ? yield geocodeAddress(deliveryAddress) : null);
        if (!pickup || !delivery) {
            return res.status(400).json({ error: "Pickup and delivery coordinates or addresses are required." });
        }
        // Assign a driver (enhance with filtering logic if needed)
        const driver = yield driver_model_1.default.findOne({ online: true, isAvailable: true });
        if (!driver) {
            return res.status(400).json({ error: "No driver available at the moment" });
        }
        // Set current location from driver
        const currentLocation = driver.location;
        // Calculate ETA
        const origin = `${pickup.latitude},${pickup.longitude}`;
        const destination = `${delivery.latitude},${delivery.longitude}`;
        const eta = yield calculateETAMinutes(origin, destination);
        // Create order
        const order = yield order_model_1.default.create({
            customerId,
            driver: driver._id,
            pickupLocation: pickup,
            deliveryLocation: delivery,
            currentLocation,
            eta,
        });
        // Update driver with current order (optional logic)
        yield driver_model_1.default.findByIdAndUpdate(driver._id, {
            currentOrder: order._id,
        });
        res.status(201).json({
            message: "Order created successfully",
            order,
        });
    }
    catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({
            message: "Error creating order",
            error: error.message || "Internal Server Error",
        });
    }
});
exports.createOrder = createOrder;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findById(req.params.orderId).populate("customerId driver");
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
});
exports.getOrderById = getOrderById;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        // Before saving order status as "cancelled"
        const order = yield order_model_1.default.findById(req.params.orderId);
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        if (status === "cancelled") {
            const now = new Date();
            const createdTime = order.createdAt.getTime();
            const timeDiffInMinutes = (now.getTime() - createdTime) / (1000 * 60);
            if (timeDiffInMinutes > 5) {
                res.status(403).json({
                    message: "Orders can only be cancelled within 5 minutes of placement.",
                });
            }
            order.cancelledAt = now;
        }
        order.status = status;
        yield order.save();
        res.status(200).json({ message: "Order status updated", order });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating order status", error: error.message });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const trackOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield order_model_1.default.findById(orderId).populate("driver");
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.status(200).json({
            orderId: order._id,
            status: order.status,
            driverLocation: order.currentLocation,
        });
    }
    catch (error) {
        console.error("Error tracking order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.trackOrder = trackOrder;
const getETA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield order_model_1.default.findById(orderId);
        if (!order || !order.currentLocation || !order.deliveryLocation) {
            res.status(404).json({ message: "Order or location data not found" });
            return;
        }
        const { latitude: originLat, longitude: originLng } = order.currentLocation;
        const { latitude: destLat, longitude: destLng } = order.deliveryLocation;
        const response = yield axios_1.default.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${GOOGLE_API_KEY}`);
        if (response.data.status !== "OK") {
            res.status(500).json({ message: "Failed to calculate ETA" });
            return;
        }
        const etaInMs = response.data.rows[0].elements[0].duration.value / 60; // Convert seconds to minutes
        order.eta = new Date(Date.now() + etaInMs); // Set ETA to current time + duration
        yield order.save();
        res.status(200).json({ orderId, eta: order.eta, message: "ETA updated successfully" });
    }
    catch (error) {
        console.error("Error calculating ETA:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getETA = getETA;
