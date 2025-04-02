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
exports.trackOrder = exports.updateOrderStatus = exports.getOrderById = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, pickupLocation, deliveryLocation } = req.body;
        const driver = yield driver_model_1.default.findOne({ isAvailable: true });
        if (!driver) {
            res.status(400).json({ message: "No available drivers" });
            return;
        }
        const order = new order_model_1.default({
            customerId,
            driver: driver._id,
            pickupLocation,
            deliveryLocation,
            currentLocation: { latitude: null, longitude: null },
        });
        driver.isAvailable = false;
        yield driver.save();
        yield order.save();
        res.status(201).json({ message: "Order created successfully", order });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating order", error: error.message });
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
        const order = yield order_model_1.default.findById(req.params.orderId);
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
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
        // Fetch order details
        const order = yield order_model_1.default.findById(orderId).populate("driver");
        if (!order) {
            res.status(404).json({ message: "Order not found" });
        }
        // Get the assigned driver’s ID
        const driverId = order === null || order === void 0 ? void 0 : order.driver;
        if (!driverId) {
            res.status(404).json({ message: "No driver assigned yet" });
        }
        // Fetch driver's real-time location
        const driver = yield driver_model_1.default.findById(driverId);
        if (!driver || !driver.location) {
            res.status(404).json({ message: "Driver location unavailable" });
        }
        res.status(200).json({
            orderId: order === null || order === void 0 ? void 0 : order._id,
            status: order === null || order === void 0 ? void 0 : order.status,
            driverLocation: driver === null || driver === void 0 ? void 0 : driver.location, // Live tracking
        });
    }
    catch (error) {
        console.error("Error tracking order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.trackOrder = trackOrder;
