"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const driver_controller_js_1 = require("../controllers/driver.controller.js");
const router = express_1.default.Router();
router.post("/register", driver_controller_js_1.registerDriver);
router.put("/:driverId/location", driver_controller_js_1.updateDriverLocation);
router.get("/:driverId/location", driver_controller_js_1.getDriverLocation);
router.get("/available", driver_controller_js_1.getAvailableDrivers);
router.patch("/:driverId/online-status", driver_controller_js_1.toggleDriverStatus);
exports.default = router;
