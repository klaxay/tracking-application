"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const customerSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    createdAt: { type: Date, default: Date.now }
});
const Customer = mongoose_1.default.model("Customer", customerSchema);
exports.default = Customer;
