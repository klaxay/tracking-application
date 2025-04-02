"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
router.post("/", order_controller_1.createOrder); // Create order & auto-assign a driver
router.get("/:orderId", order_controller_1.getOrderById); // Get order by ID
router.put("/:orderId/status", order_controller_1.updateOrderStatus); // Update order status
router.get("/:orderId/track", order_controller_1.trackOrder); // Track order location
exports.default = router;
