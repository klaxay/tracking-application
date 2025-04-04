"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const driverSchema = new mongoose_1.default.Schema({
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
const Driver = mongoose_1.default.model("Driver", driverSchema);
exports.default = Driver;
