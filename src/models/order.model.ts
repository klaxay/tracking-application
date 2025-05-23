import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true }, // Assigned at creation
    pickupLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    deliveryLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    currentLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    eta: { type: Date, required: true }, // Estimated Time of Arrival in minutes
    status: {
      type: String,
      enum: ["assigned", "in transit", "delivered", "cancelled"],
      default: "assigned",
    },
    cancelledAt : {
      type: Date, 
      default: null
    }
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

const Order = mongoose.model("Order", orderSchema);
export default Order;