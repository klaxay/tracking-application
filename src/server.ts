import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connectdb.js';
import { wss } from './websocket/orderTracking.js';

import driverRoutes from './routes/driver.route.js';
import customerRoutes from './routes/customer.route.js';
import orderRoutes from './routes/order.route.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/drivers', driverRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);

const PORT: string | number = process.env.PORT || 3000;

connectDB();

wss.on('listening', () => {
    console.log('WebSocket server is listening for connections');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
