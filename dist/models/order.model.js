"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    customerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Customer", required: true },
    driver: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Driver", required: true }, // Assigned at creation
    pickupLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    deliveryLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    currentLocation: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
    },
    status: {
        type: String,
        enum: ["assigned", "in transit", "delivered"],
        default: "assigned",
    },
}, { timestamps: true } // Automatically adds createdAt & updatedAt fields
);
const Order = mongoose_1.default.model("Order", orderSchema);
exports.default = Order;
