"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const router = (0, express_1.Router)();
router.post("/register", customer_controller_1.registerCustomer);
router.get("/", customer_controller_1.getAllCustomers);
router.get("/:id", customer_controller_1.getCustomerById);
exports.default = router;
