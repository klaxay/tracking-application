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
exports.getCustomerById = exports.getAllCustomers = exports.registerCustomer = void 0;
const customer_model_1 = __importDefault(require("../models/customer.model"));
const registerCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = new customer_model_1.default(req.body);
        yield customer.save();
        res.status(201).json({ message: "Customer registered successfully", customer });
    }
    catch (err) {
        res.status(500).json({ message: "Error registering customer", error: err.message });
    }
});
exports.registerCustomer = registerCustomer;
const getAllCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield customer_model_1.default.find();
        res.status(200).json(customers);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching customers", error: err.message });
    }
});
exports.getAllCustomers = getAllCustomers;
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield customer_model_1.default.findById(req.params.id);
        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.status(200).json(customer);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching customer", error: err.message });
    }
});
exports.getCustomerById = getCustomerById;
