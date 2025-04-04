"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const connectdb_js_1 = __importDefault(require("./db/connectdb.js"));
const orderTracking_js_1 = require("./websocket/orderTracking.js");
const driver_route_js_1 = __importDefault(require("./routes/driver.route.js"));
const customer_route_js_1 = __importDefault(require("./routes/customer.route.js"));
const order_route_js_1 = __importDefault(require("./routes/order.route.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/drivers', driver_route_js_1.default);
app.use('/api/customers', customer_route_js_1.default);
app.use('/api/orders', order_route_js_1.default);
const PORT = process.env.PORT || 3000;
(0, connectdb_js_1.default)();
orderTracking_js_1.wss.on('listening', () => {
    console.log('WebSocket server is listening for connections');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
