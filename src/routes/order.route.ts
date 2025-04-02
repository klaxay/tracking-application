import express from "express";
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
  trackOrder,
} from "../controllers/order.controller";

const router = express.Router();

router.post("/", createOrder); // Create order & auto-assign a driver
router.get("/:orderId", getOrderById); // Get order by ID
router.put("/:orderId/status", updateOrderStatus); // Update order status
router.get("/:orderId/track", trackOrder); // Track order location

export default router;
