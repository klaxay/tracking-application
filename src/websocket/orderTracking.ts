import { WebSocketServer } from 'ws';
import Order from '../models/order.model';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
const wss = new WebSocketServer({ port: 8080 }); // WebSocket server on port 8080
const drivers = new Map(); // Store driver connections

async function calculateETA(driverLocation: any, deliveryLocation: any) {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: {
                origins: `${driverLocation.latitude},${driverLocation.longitude}`,
                destinations: `${deliveryLocation.latitude},${deliveryLocation.longitude}`,
                key: GOOGLE_MAPS_API_KEY,
            },
        });

        const etaInSeconds = response.data.rows[0].elements[0].duration.value;
        return new Date(Date.now() + etaInSeconds * 1000);
    } catch (error) {
        console.error('Error calculating ETA:', error);
        return null;
    }
}

wss.on('connection', (ws, req) => {
    console.log('Driver connected');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());
            const { driverId, latitude, longitude } = data;

            // Store driver socket
            drivers.set(driverId, ws);

            // Find the order and update location
            const order = await Order.findOneAndUpdate(
                { driver: driverId, status: { $ne: 'delivered' } },
                { $set: { currentLocation: { latitude, longitude }, updatedAt: new Date() } },
                { new: true }
            );

            if (order) {
                const eta = await calculateETA({ latitude, longitude }, order.deliveryLocation);
                if (eta) {
                    order.eta = eta;
                    await order.save();
                }
            }

            console.log(`Updated location & ETA for driver ${driverId}`);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Driver disconnected');
        drivers.forEach((value, key) => {
            if (value === ws) {
                drivers.delete(key);
            }
        });
    });
});

export { wss, drivers };
