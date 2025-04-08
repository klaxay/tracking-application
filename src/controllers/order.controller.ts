import { Request, Response } from "express";
import Order from "../models/order.model";
import Driver from "../models/driver.model";
import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const geocodeAddress = async (address: string) => {
  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const response = await axios.get(url, {
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  const data = response.data;
  if (data.status !== "OK" || data.results.length === 0) {
    throw new Error("Failed to geocode address");
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { latitude: lat, longitude: lng };
};

const calculateETAMinutes = async (origin: string, destination: string) => {
  const url = "https://maps.googleapis.com/maps/api/distancematrix/json";
  const response = await axios.get(url, {
    params: {
      origins: origin,
      destinations: destination,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  const data = response.data;
  const element = data.rows[0]?.elements[0];

  if (
    data.status !== "OK" ||
    !element ||
    element.status !== "OK"
  ) {
    throw new Error("Failed to calculate ETA");
  }

  const durationInSeconds = element.duration.value;
  const eta = new Date(Date.now() + durationInSeconds * 1000); // convert seconds to milliseconds
  return eta;
};

export const createOrder = async (req: Request, res: Response): Promise<Response | void> => {
  try {


    // Check whether an order already exists
    const activeOrders = await Order.find({ status: { $ne: "delivered" } });
    if(activeOrders){
      return res.status(400).json({ error: "You already have an active order" });
    }


    const {
      customerId,
      pickupAddress,
      deliveryAddress,
      pickupCoordinates,
      deliveryCoordinates,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Determine coordinates
    const pickup = pickupCoordinates || (pickupAddress ? await geocodeAddress(pickupAddress) : null);
    const delivery = deliveryCoordinates || (deliveryAddress ? await geocodeAddress(deliveryAddress) : null);

    if (!pickup || !delivery) {
      return res.status(400).json({ error: "Pickup and delivery coordinates or addresses are required." });
    }

    // Assign a driver (enhance with filtering logic if needed)
    const driver = await Driver.findOne({online:true, isAvailable:true})
    if (!driver) {
      return res.status(400).json({ error: "No driver available at the moment" });
    }

    // Set current location from driver
    const currentLocation = driver.location;

    // Calculate ETA
    const origin = `${pickup.latitude},${pickup.longitude}`;
    const destination = `${delivery.latitude},${delivery.longitude}`;
    const eta = await calculateETAMinutes(origin, destination);

    // Create order
    const order = await Order.create({
      customerId,
      driver: driver._id,
      pickupLocation: pickup,
      deliveryLocation: delivery,
      currentLocation,
      eta,
    });

    // Update driver with current order (optional logic)
    await Driver.findByIdAndUpdate(driver._id, {
      currentOrder: order._id,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (error: any) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      message: "Error creating order",
      error: error.message || "Internal Server Error",
    });
  }
};
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.orderId).populate("customerId driver");
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    // Before saving order status as "cancelled"
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    if (status === "cancelled") {
      const now = new Date();
      const createdTime = order.createdAt.getTime();
      const timeDiffInMinutes = (now.getTime() - createdTime) / (1000 * 60);

      if (timeDiffInMinutes > 5) {
        res.status(403).json({
          message: "Orders can only be cancelled within 5 minutes of placement.",
        });
      }

      order.cancelledAt = now; // Optional: Track when cancelled
    }


    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error: (error as Error).message });
  }
};

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("driver");
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({
      orderId: order._id,
      status: order.status,
      driverLocation: order.currentLocation,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getETA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order || !order.currentLocation || !order.deliveryLocation) {
      res.status(404).json({ message: "Order or location data not found" });
      return;
    }

    const { latitude: originLat, longitude: originLng } = order.currentLocation;
    const { latitude: destLat, longitude: destLng } = order.deliveryLocation;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${GOOGLE_API_KEY}`
    );

    if (response.data.status !== "OK") {
      res.status(500).json({ message: "Failed to calculate ETA" });
      return;
    }

    const etaInMs = response.data.rows[0].elements[0].duration.value / 60; // Convert seconds to minutes
    order.eta = new Date(Date.now() + etaInMs ); // Set ETA to current time + duration
    await order.save();

    res.status(200).json({ orderId, eta: order.eta, message: "ETA updated successfully" });
  } catch (error) {
    console.error("Error calculating ETA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
