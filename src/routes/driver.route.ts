import express from "express";
import {
  registerDriver,
  updateDriverLocation,
  getDriverLocation,
  getAvailableDrivers,
} from "../controllers/driver.controller.js";

const router = express.Router();
router.post("/register", registerDriver);
router.put("/:driverId/location", updateDriverLocation);
router.get("/:driverId/location", getDriverLocation);
router.get("/available", getAvailableDrivers);

export default router;
