import { Request, Response } from "express";
import Order from "../models/order.model";
import Driver from "../models/driver.model";
import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, pickupLocation, deliveryLocation } = req.body;

    const driver = await Driver.findOne({ isAvailable: true });
    if (!driver) {
      res.status(400).json({ message: "No available drivers" });
      return;
    }

    const order = new Order({
      customerId,
      driver: driver._id,
      pickupLocation,
      deliveryLocation,
      currentLocation: { latitude: null, longitude: null },
    });

    driver.isAvailable = false;
    await driver.save();
    await order.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: (error as Error).message });
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
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
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
