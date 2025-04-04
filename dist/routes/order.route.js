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
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, order_controller_1.createOrder)(req, res); // Create order & auto-assign a driver
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create order" });
    }
}));
router.get("/:orderId", order_controller_1.getOrderById); // Get order by ID
router.put("/:orderId/status", order_controller_1.updateOrderStatus); // Update order status
router.get("/:orderId/track", order_controller_1.trackOrder); // Track order location
exports.default = router;
