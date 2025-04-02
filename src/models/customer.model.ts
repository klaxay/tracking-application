import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String
    },
    createdAt: { type: Date, default: Date.now }
  });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;