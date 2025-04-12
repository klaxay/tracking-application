import { Request, Response } from "express";
import Customer from "../models/customer.model";

export const registerCustomer = async (req: Request, res: Response) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json({ message: "Customer registered successfully", customer });
    } catch (err) {
        res.status(500).json({ message: "Error registering customer", error: (err as Error).message });
    }
};
export const getAllCustomers = async (req: Request, res: Response) => {
    try {
      const customers = await Customer.find();
      res.status(200).json(customers);
    } catch (err) {
      res.status(500).json({ message: "Error fetching customers", error: (err as Error).message });
    }
  };
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      res.status(200).json(customer);
    } catch (err) {
      res.status(500).json({ message: "Error fetching customer", error: (err as Error).message });
    }
  };
  
