import express from "express";
import {
  registerDriver,
  updateDriverLocation,
  getDriverLocation,
  getAvailableDrivers,
  toggleDriverStatus
} from "../controllers/driver.controller.js";

const router = express.Router();
router.post("/register", registerDriver);
router.put("/:driverId/location", updateDriverLocation);
router.get("/:driverId/location", getDriverLocation);
router.get("/available", getAvailableDrivers);
router.patch("/:driverId/online-status", toggleDriverStatus);

export default router;
