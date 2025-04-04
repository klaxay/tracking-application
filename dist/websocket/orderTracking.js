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
exports.drivers = exports.wss = void 0;
const ws_1 = require("ws");
const order_model_1 = __importDefault(require("../models/order.model"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const axios_1 = __importDefault(require("axios"));
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const wss = new ws_1.WebSocketServer({ port: 8080 }); // WebSocket server on port 8080
exports.wss = wss;
const drivers = new Map(); // Store driver connections
exports.drivers = drivers;
function calculateETA(driverLocation, deliveryLocation) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
                params: {
                    origins: `${driverLocation.latitude},${driverLocation.longitude}`,
                    destinations: `${deliveryLocation.latitude},${deliveryLocation.longitude}`,
                    key: GOOGLE_MAPS_API_KEY,
                },
            });
            const etaInSeconds = response.data.rows[0].elements[0].duration.value;
            return new Date(Date.now() + etaInSeconds * 1000);
        }
        catch (error) {
            console.error('Error calculating ETA:', error);
            return null;
        }
    });
}
wss.on('connection', (ws, req) => {
    console.log('Driver connected');
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Received message:', message);
        try {
            const data = JSON.parse(message.toString());
            const { driverId, latitude, longitude } = data;
            // Store driver socket
            drivers.set(driverId, ws);
            // Find the order and update location
            const order = yield order_model_1.default.findOneAndUpdate({ driver: driverId, status: { $ne: 'delivered' } }, { $set: { currentLocation: { latitude, longitude }, updatedAt: new Date() } }, { new: true });
            if (order) {
                const eta = yield calculateETA({ latitude, longitude }, order.deliveryLocation);
                if (eta) {
                    order.eta = eta;
                    yield order.save();
                }
                yield driver_model_1.default.findByIdAndUpdate(driverId, {
                    $set: {
                        location: {
                            latitude,
                            longitude,
                        },
                        updatedAt: new Date()
                    }
                }).then(() => { console.log(`Driver ${driverId} location updated`); }).catch((err) => { console.log(err); });
            }
            console.log(`Updated location & ETA for driver ${driverId}`);
        }
        catch (error) {
            console.error('Error processing message:', error);
        }
    }));
    ws.on('close', () => {
        console.log('Driver disconnected');
        drivers.forEach((value, key) => {
            if (value === ws) {
                drivers.delete(key);
            }
        });
    });
});
