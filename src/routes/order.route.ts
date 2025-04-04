import express from "express";
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
  trackOrder,
} from "../controllers/order.controller";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const result = await createOrder(req, res); // Create order & auto-assign a driver
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});
router.get("/:orderId", getOrderById); // Get order by ID
router.put("/:orderId/status", updateOrderStatus); // Update order status
router.get("/:orderId/track", trackOrder); // Track order location

export default router;
