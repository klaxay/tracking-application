# tracking-application

Tracking-Application is a real-time delivery tracking system built using **Node.js, Express.js, MongoDB, WebSockets**, and **Google Maps APIs**. It allows customers to track their orders, calculates ETAs, and provides live updates on driver locations.

## 🚀 Features
- **Order Management**: Customers can place orders with pickup and delivery locations.
- **Driver Assignment**: The system automatically assigns an available driver.
- **Live Location Tracking**: Uses WebSockets and Google Geolocation API to update driver locations.
- **ETA Calculation**: Uses Google Maps Distance Matrix API to estimate arrival times.
- **Order Status Updates**: Customers can track their order's progress.

---

## 🛠️ Setup Instructions

### 1️⃣ Prerequisites
Ensure you have the following installed:
- Node.js (v16+ recommended)
- MongoDB (local or cloud-based like MongoDB Atlas)
- A Google Cloud API key with **Geolocation API** and **Distance Matrix API** enabled

### 2️⃣ Installation
Clone the repository and install dependencies:
```sh
git clone https://github.com/klaxay/tracking-application.git
cd tracking-application
npm install
```

### 3️⃣ Environment Variables
Create a `.env` file in the root directory and add:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4️⃣ Start the Server
```sh
npm run dev
```

---

## 📌 API Documentation

### 📍 Orders API

#### ➤ Create an Order
**POST** `/api/orders`
```json
{
  "customerId": "64a3e2b5f1d6a9a2f8765432",
  "pickupLocation": { "latitude": 37.7749, "longitude": -122.4194 },
  "deliveryLocation": { "latitude": 37.3382, "longitude": -121.8863 }
}
```
**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "650c0e5a8b34234a2e3e3b5a",
    "customerId": "64a3e2b5f1d6a9a2f8765432",
    "driver": "64b3d1e4a2e2a9b7c2345678",
    "status": "assigned"
  }
}
```

#### ➤ Get Order by ID
**GET** `/api/orders/:orderId`

#### ➤ Update Order Status
**PUT** `/api/orders/:orderId/status`
```json
{
  "status": "in transit"
}
```

#### ➤ Track Order Location
**GET** `/api/orders/:orderId/track`
**Response:**
```json
{
  "orderId": "650c0e5a8b34234a2e3e3b5a",
  "status": "in transit",
  "driverLocation": { "latitude": 37.7749, "longitude": -122.4194 },
  "eta": 12
}
```

---

## 📍 Customers API

#### ➤ Create a Customer
**POST** `/api/customers`
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "phone": "1234567890"
}
```

#### ➤ Get Customer by ID
**GET** `/api/customers/:customerId`

---

## 📍 Drivers API

#### ➤ Create a Driver
**POST** `/api/drivers`
```json
{
  "name": "Alice Smith",
  "vehicle": "Toyota Prius",
  "isAvailable": true
}
```

#### ➤ Get Available Drivers
**GET** `/api/drivers/available`

#### ➤ Update Driver Location
**PUT** `/api/drivers/:driverId/location`
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

---

## 📡 WebSocket Connection
Tracking-Application uses WebSockets to send live location updates.

### **Client-Side Connection**
```js
const ws = new WebSocket("ws://localhost:3000");
ws.onopen = () => {
    ws.send(JSON.stringify({ driverId: "64b3d1e4a2e2a9b7c2345678" }));
};
ws.onmessage = (event) => {
    console.log("Live Location Update:", event.data);
};
```

---

