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
